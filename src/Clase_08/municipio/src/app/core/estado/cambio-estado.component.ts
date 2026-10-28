import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import {
  IonBadge, IonButton, IonItem, IonTextarea, IonNote, IonSpinner, ToastController,
} from '@ionic/angular';
import { Incidencia } from '../models/incidencia.model';
import { IncidenciasService } from '../services/incidencias.service';
import {
  Estado, TRANSICIONES, ETIQUETA_ESTADO, COLOR_ESTADO, puedeCambiar,
} from '../utils/estados';

@Component({
  selector: 'app-cambio-estado',
  standalone: true,
  imports: [FormsModule, IonBadge, IonButton, IonItem, IonTextarea, IonNote, IonSpinner],
  template: `
    <h2 class="seccion">Estado</h2>
    <p>
      Actual:
      <ion-badge [color]="color(actual())">{{ etiqueta(actual()) }}</ion-badge>
    </p>

    @if (opciones().length === 0) {
      <ion-note>
        Esta incidencia está resuelta. Su estado es final y no puede volver a pendiente ni a en proceso.
      </ion-note>
    } @else {
      <p>Cambiar a:</p>
      <div class="opciones">
        @for (e of opciones(); track e) {
          <ion-button [fill]="destino() === e ? 'solid' : 'outline'" [color]="color(e)"
                      (click)="seleccionar(e)">
            {{ etiqueta(e) }}
          </ion-button>
        }
      </div>

      @if (destino() === 'resuelta') {
        <ion-item>
          <ion-textarea label="Observación de cierre *" labelPlacement="floating"
                        [autoGrow]="true" [counter]="true" [maxlength]="300"
                        [(ngModel)]="observacion"></ion-textarea>
        </ion-item>
      }

      @if (error()) {
        <ion-note color="danger" class="msg">{{ error() }}</ion-note>
      }

      <ion-button expand="block" size="large" class="ion-margin-top"
                  (click)="confirmar()" [disabled]="!destino() || guardando()">
        @if (guardando()) {
          <ion-spinner name="crescent"></ion-spinner>
        } @else {
          Confirmar cambio
        }
      </ion-button>
    }

    @if (incidencia().observacion) {
      <p class="obs"><strong>Observación:</strong> {{ incidencia().observacion }}</p>
    }
  `,
  styles: [`
    .seccion { font-size: 1.05rem; font-weight: 600; margin: 20px 0 8px; }
    .opciones { display: flex; flex-wrap: wrap; gap: 4px; }
    .msg { display: block; margin: 8px 0; }
    .obs { margin-top: 12px; }
  `],
})
export class CambioEstadoComponent {
  private svc = inject(IncidenciasService);
  private toast = inject(ToastController);

  incidencia = input.required<Incidencia>();
  actualizada = output<Incidencia>();

  actual = computed(() => this.incidencia().estado as Estado);
  opciones = computed(() => TRANSICIONES[this.actual()] ?? []);

  destino = signal<Estado | null>(null);
  observacion = signal('');
  error = signal<string | null>(null);
  guardando = signal(false);

  etiqueta(e: Estado) { return ETIQUETA_ESTADO[e] ?? e; }
  color(e: Estado) { return COLOR_ESTADO[e] ?? 'medium'; }

  seleccionar(e: Estado) {
    this.destino.set(e);
    this.error.set(null);
  }

  async confirmar() {
    const destino = this.destino();
    const actual = this.actual();

    // Segunda barrera: aunque la UI solo muestra opciones válidas, se valida otra vez
    if (!destino || !puedeCambiar(actual, destino)) {
      this.error.set(`No se permite pasar de ${this.etiqueta(actual)} a ${destino ? this.etiqueta(destino) : '—'}.`);
      return;
    }

    const obs = (this.observacion() ?? '').trim();
    if (destino === 'resuelta' && obs.length < 5) {
      this.error.set('Para marcarla como resuelta, la observación es obligatoria (mínimo 5 caracteres).');
      return;
    }

    this.guardando.set(true);
    this.error.set(null);
    try {
      const resultado = await firstValueFrom(
        this.svc.actualizar({
          ...this.incidencia(),
          estado: destino,
          observacion: destino === 'resuelta' ? obs : this.incidencia().observacion ?? '',
        } as Incidencia)
      );
      this.destino.set(null);
      this.observacion.set('');
      this.actualizada.emit(resultado);
      const t = await this.toast.create({
        message: `Estado actualizado a ${this.etiqueta(destino)}.`,
        color: 'success', duration: 2500, position: 'bottom',
      });
      await t.present();
    } catch {
      // No se cambia nada localmente: la pantalla sigue mostrando el estado real
      this.error.set('No se pudo actualizar en el servicio de oficina. Inténtalo de nuevo.');
    } finally {
      this.guardando.set(false);
    }
  }
}