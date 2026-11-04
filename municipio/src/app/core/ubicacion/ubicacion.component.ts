import { Component, inject, input, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonButton, IonSpinner, IonItem, IonInput, IonNote } from '@ionic/angular';
import { UbicacionService } from '../services/ubicacion.service';
import { coordenadasValidas } from '../utils/coordenadas';

@Component({
  selector: 'app-ubicacion',
  standalone: true,
  imports: [FormsModule, IonButton, IonSpinner, IonItem, IonInput, IonNote],
  template: `
    <ion-button expand="block" (click)="obtener()" [disabled]="cargando()">
      Obtener ubicación actual
    </ion-button>

    @if (cargando()) {
      <div class="centro"><ion-spinner></ion-spinner></div>
    }

    @if (mensaje()) {
      <ion-note color="danger" class="msg">{{ mensaje() }}</ion-note>
    }

    @if (latitud() !== null && longitud() !== null) {
      <p><strong>Coordenadas:</strong> {{ latitud() }}, {{ longitud() }}</p>
      <ion-button fill="clear" size="small" color="medium" (click)="limpiar()">
        Quitar ubicación
      </ion-button>
    } @else if (obligatoria()) {
      <ion-note color="danger" class="msg">
        La ubicación es obligatoria para este tipo de incidencia.
      </ion-note>
    }

    <ion-button fill="clear" size="small" (click)="manual.set(!manual())">
      Ingresar coordenadas manualmente
    </ion-button>

    @if (manual()) {
      <ion-item>
        <ion-input label="Latitud" labelPlacement="floating" type="text"
                   placeholder="-0.180700" [(ngModel)]="latTxt"></ion-input>
      </ion-item>
      <ion-item>
        <ion-input label="Longitud" labelPlacement="floating" type="text"
                   placeholder="-78.467800" [(ngModel)]="lonTxt"></ion-input>
      </ion-item>
      @if (errorManual()) {
        <ion-note color="danger" class="msg">{{ errorManual() }}</ion-note>
      }
      <ion-button expand="block" fill="outline" (click)="aplicarManual()">
        Usar estas coordenadas
      </ion-button>
    }
  `,
  styles: [`.centro { text-align: center; padding: 8px; } .msg { display: block; margin: 8px 0; }`],
})
export class UbicacionComponent {
  private svc = inject(UbicacionService);

  latitud = model<number | null>(null);
  longitud = model<number | null>(null);
  obligatoria = input(false);

  cargando = signal(false);
  mensaje = signal<string | null>(null);
  manual = signal(false);
  errorManual = signal<string | null>(null);
  latTxt = '';
  lonTxt = '';

  async obtener() {
    this.mensaje.set(null);
    this.cargando.set(true);
    const r = await this.svc.obtener();
    this.cargando.set(false);

    if (r.estado === 'ok') {
      this.latitud.set(r.latitud);
      this.longitud.set(r.longitud);
      this.manual.set(false);
      return;
    }
    // Ante cualquier fallo se conservan las coordenadas previas y se ofrece la entrada manual
    this.mensaje.set(
      r.estado === 'denegado'
        ? 'Permiso de ubicación denegado. Puedes ingresar las coordenadas manualmente.'
        : 'No se pudo obtener la ubicación (revisa que el GPS esté activo). Puedes ingresar las coordenadas manualmente.'
    );
    this.manual.set(true);
  }

  aplicarManual() {
    const lat = this.parse(this.latTxt);
    const lon = this.parse(this.lonTxt);
    if (!coordenadasValidas(lat, lon)) {
      this.errorManual.set('Coordenadas no válidas: latitud entre -90 y 90, longitud entre -180 y 180.');
      return;
    }
    this.latitud.set(lat);
    this.longitud.set(lon);
    this.errorManual.set(null);
    this.mensaje.set(null);
    this.manual.set(false);
  }

  limpiar() {
    this.latitud.set(null);
    this.longitud.set(null);
  }

  private parse(t: string | number | null | undefined): number {
    const s = String(t ?? '').trim().replace(',', '.');
    return /^-?\d+(\.\d+)?$/.test(s) ? Number(s) : NaN;
  }
}
