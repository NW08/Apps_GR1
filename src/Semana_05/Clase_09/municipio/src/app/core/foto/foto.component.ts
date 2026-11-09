import { Component, inject, input, model, signal } from '@angular/core';
import { IonButton, IonIcon, IonNote } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { cameraOutline, trashOutline } from 'ionicons/icons';
import { FotoService } from '../services/foto.service';

@Component({
  selector: 'app-foto',
  standalone: true,
  imports: [IonButton, IonIcon, IonNote],
  template: `
    @if (foto(); as src) {
      <img [src]="src" alt="Fotografía de la incidencia" class="preview" />
    } @else {
      <button type="button" class="vacia" [class.obligatoria]="obligatoria()" (click)="capturar()"
              [disabled]="capturando()">
        <ion-icon name="camera-outline"></ion-icon>
        <span>{{ obligatoria() ? 'La fotografía es obligatoria para prioridad alta' : 'Fotografía opcional' }}</span>
      </button>
    }

    <div class="botones">
      <ion-button expand="block" (click)="capturar()" [disabled]="capturando()">
        <ion-icon slot="start" name="camera-outline"></ion-icon>
        {{ foto() ? 'Retomar foto' : 'Tomar foto' }}
      </ion-button>
      @if (foto()) {
        <ion-button expand="block" fill="outline" color="medium" (click)="foto.set(null)">
          <ion-icon slot="start" name="trash-outline"></ion-icon>
          Quitar
        </ion-button>
      }
    </div>

    @if (mensaje()) {
      <ion-note color="danger" class="msg">{{ mensaje() }}</ion-note>
    }
  `,
  styles: [`
    .preview { width: 100%; max-height: 260px; object-fit: cover; border-radius: 10px; display: block; }
    .vacia {
      width: 100%; padding: 24px 12px; border-radius: 10px; border: 2px dashed var(--ion-color-medium-tint);
      background: var(--ion-color-light); color: var(--ion-color-medium); font: inherit;
      display: flex; flex-direction: column; align-items: center; gap: 6px;
    }
    .vacia.obligatoria { border-color: var(--ion-color-danger); color: var(--ion-color-danger); }
    .vacia ion-icon { font-size: 36px; }
    .botones { display: flex; gap: 8px; margin-top: 8px; }
    .botones ion-button { flex: 1; margin: 0; }
    .msg { display: block; margin-top: 8px; }
  `],
})
export class FotoComponent {
  private svc = inject(FotoService);

  foto = model<string | null>(null);
  obligatoria = input(false);

  capturando = signal(false);
  mensaje = signal<string | null>(null);

  constructor() {
    addIcons({ cameraOutline, trashOutline });
  }

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
