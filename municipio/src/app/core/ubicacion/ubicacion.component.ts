import { Component, inject, input, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonButton, IonSpinner, IonInput, IonNote, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { closeCircle, locateOutline, location as locationIcon } from 'ionicons/icons';
import { UbicacionService } from '../services/ubicacion.service';
import { coordenadasValidas } from '../utils/coordenadas';

@Component({
  selector: 'app-ubicacion',
  standalone: true,
  imports: [FormsModule, IonButton, IonSpinner, IonInput, IonNote, IonIcon],
  template: `
    @if (latitud() !== null && longitud() !== null) {
      <div class="coords">
        <ion-icon name="location" color="primary"></ion-icon>
        <span>{{ latitud() }}, {{ longitud() }}</span>
        <ion-button fill="clear" size="small" color="medium" (click)="limpiar()" aria-label="Quitar ubicación">
          <ion-icon slot="icon-only" name="close-circle"></ion-icon>
        </ion-button>
      </div>
    } @else if (obligatoria()) {
      <ion-note color="danger" class="msg">La ubicación es obligatoria para un bache.</ion-note>
    }

    <ion-button expand="block" (click)="obtener()" [disabled]="cargando()">
      @if (cargando()) {
        <ion-spinner name="crescent"></ion-spinner>&nbsp;Obteniendo ubicación…
      } @else {
        <ion-icon slot="start" name="locate-outline"></ion-icon>
        {{ latitud() !== null ? 'Actualizar con GPS' : 'Usar ubicación actual' }}
      }
    </ion-button>

    @if (mensaje()) {
      <ion-note color="danger" class="msg">{{ mensaje() }}</ion-note>
    }

    <ion-button fill="clear" size="small" expand="block" (click)="manual.set(!manual())">
      {{ manual() ? 'Ocultar ingreso manual' : 'Ingresar coordenadas manualmente' }}
    </ion-button>

    @if (manual()) {
      <div class="manual">
        <ion-input label="Latitud" labelPlacement="floating" fill="outline" inputmode="decimal"
                   placeholder="-0.180700" [(ngModel)]="latTxt"></ion-input>
        <ion-input label="Longitud" labelPlacement="floating" fill="outline" inputmode="decimal"
                   placeholder="-78.467800" [(ngModel)]="lonTxt"></ion-input>
      </div>
      @if (errorManual()) {
        <ion-note color="danger" class="msg">{{ errorManual() }}</ion-note>
      }
      <ion-button expand="block" fill="outline" (click)="aplicarManual()">Usar estas coordenadas</ion-button>
    }
  `,
  styles: [`
    .coords {
      display: flex; align-items: center; gap: 8px; padding: 4px 4px 4px 12px; margin-bottom: 8px;
      border-radius: 10px; background: var(--ion-color-light);
    }
    .coords span { flex: 1; font-variant-numeric: tabular-nums; }
    .manual { display: flex; gap: 8px; margin-bottom: 8px; }
    .msg { display: block; margin: 8px 0; }
  `],
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

  constructor() {
    addIcons({ closeCircle, locateOutline, location: locationIcon });
  }

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
