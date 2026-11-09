import { Component, inject, input, model, signal } from '@angular/core';
import { IonButton, IonNote } from '@ionic/angular';
import { FotoService } from '../services/foto.service';

@Component({
  selector: 'app-foto',
  standalone: true,
  imports: [IonButton, IonNote],
  template: `
    @if (foto(); as src) {
      <img [src]="src" alt="Fotografía de la incidencia" class="preview" />
    } @else if (obligatoria()) {
      <ion-note color="danger">La fotografía es obligatoria para esta incidencia.</ion-note>
    } @else {
      <ion-note>La fotografía es opcional.</ion-note>
    }

    <ion-button expand="block" (click)="capturar()" [disabled]="capturando()">
      {{ foto() ? 'Retomar foto' : 'Tomar foto' }}
    </ion-button>

    @if (foto()) {
      <ion-button expand="block" fill="clear" color="medium" (click)="foto.set(null)">
        Quitar foto
      </ion-button>
    }

    @if (mensaje()) {
      <ion-note color="danger" class="msg">{{ mensaje() }}</ion-note>
    }
  `,
  styles: [`
    .preview { width: 100%; max-height: 280px; object-fit: cover; border-radius: 8px; margin-bottom: 8px; }
    .msg { display: block; margin-top: 8px; }
  `],
})
export class FotoComponent {
  private svc = inject(FotoService);

  foto = model<string | null>(null);
  obligatoria = input(false);

  capturando = signal(false);
  mensaje = signal<string | null>(null);

  async capturar() {
    this.mensaje.set(null);
    this.capturando.set(true);
    const r = await this.svc.capturar();
    this.capturando.set(false);

    switch (r.estado) {
      case 'ok':
        this.foto.set(r.dataUrl);
        break;
      case 'cancelado':
        break; // no se toca la foto previa ni ningún otro dato
      case 'denegado':
        this.mensaje.set(
          this.obligatoria()
            ? 'Sin permiso de cámara no se puede tomar la fotografía, y esta incidencia la exige, así que no podrá guardarse. Habilita el permiso en Ajustes > Aplicaciones > UrbanInspect > Permisos.'
            : 'Permiso de cámara denegado. La foto es opcional: puedes continuar sin ella o habilitar el permiso en Ajustes > Aplicaciones > UrbanInspect > Permisos.'
        );
        break;
      case 'error':
        this.mensaje.set('No se pudo capturar la fotografía. Inténtalo de nuevo.');
        break;
    }
  }
}
