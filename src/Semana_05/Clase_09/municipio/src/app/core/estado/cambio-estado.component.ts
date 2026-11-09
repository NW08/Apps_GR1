import { Component, computed, effect, inject, input, output, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import {
  IonBadge, IonButton, IonTextarea, IonNote, IonSpinner, IonIcon, AlertController, ToastController,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { checkmarkCircleOutline, lockClosedOutline } from 'ionicons/icons';
import { Incidencia } from '../models/incidencia.model';
import { IncidenciasService } from '../services/incidencias.service';
import {
  Estado, TRANSICIONES, ETIQUETA_ESTADO, COLOR_ESTADO, puedeCambiar,
} from '../utils/estados';

@Component({
  selector: 'app-cambio-estado',
  standalone: true,
  imports: [FormsModule, IonBadge, IonButton, IonTextarea, IonNote, IonSpinner, IonIcon],
  template: `
    <div class="cabecera">
      <h2 class="seccion">Estado</h2>
      <ion-badge [color]="color(actual())">{{ etiqueta(actual()) }}</ion-badge>
    </div>

    @if (opciones().length === 0) {
      <p class="final">
        <ion-icon name="lock-closed-outline"></ion-icon>
        Incidencia resuelta. Es un estado final y no puede volver a pendiente ni a en proceso.
      </p>
    } @else {
      <p class="ayuda">Cambiar a:</p>
      <div class="opciones">
        @for (e of opciones(); track e) {
          <ion-button [fill]="destino() === e ? 'solid' : 'outline'" [color]="color(e)"
                      (click)="seleccionar(e)">
            {{ etiqueta(e) }}
          </ion-button>
        }
      </div>

      @if (destino() === 'resuelta') {
        <ion-textarea label="Observación de cierre *" labelPlacement="floating" fill="outline"
                      [autoGrow]="true" [counter]="true" [maxlength]="300"
                      helperText="Mínimo 5 caracteres"
                      [(ngModel)]="observacion"></ion-textarea>
      }

      @if (error()) {
        <ion-note color="danger" class="msg">{{ error() }}</ion-note>
      }

      <ion-button expand="block" class="ion-margin-top"
                  (click)="confirmar()" [disabled]="!destino() || guardando()">
        @if (guardando()) {
          <ion-spinner name="crescent"></ion-spinner>
        } @else {
          <ion-icon slot="start" name="checkmark-circle-outline"></ion-icon>
          Confirmar cambio
        }
      </ion-button>
    }

    @if (incidencia().observacion) {
      <div class="obs">
        <strong>Observación de cierre</strong>
        <p>{{ incidencia().observacion }}</p>
      </div>
    }
  `,
  styles: [`
    .cabecera { display: flex; justify-content: space-between; align-items: center; }
    .cabecera .seccion { margin: 0; }
    .ayuda { margin: 12px 0 6px; color: var(--ion-color-medium); }
    .opciones { display: flex; gap: 8px; }
    .opciones ion-button { flex: 1; margin: 0; }
    ion-textarea { margin-top: 12px; }
    .msg { display: block; margin: 8px 0; }
    .final { display: flex; gap: 8px; align-items: flex-start; color: var(--ion-color-medium); }
    .final ion-icon { flex: 0 0 auto; font-size: 18px; margin-top: 2px; }
    .obs { margin-top: 12px; padding: 10px 12px; border-radius: 10px; background: var(--ion-color-light); }
    .obs p { margin: 4px 0 0; }
  `],
})
export class CambioEstadoComponent {
  private svc = inject(IncidenciasService);
  private toast = inject(ToastController);
  private alert = inject(AlertController);

  incidencia = input.required<Incidencia>();
  actualizada = output<Incidencia>();

  actual = computed(() => this.incidencia().estado as Estado);
  opciones = computed(() => TRANSICIONES[this.actual()] ?? []);

  destino = signal<Estado | null>(null);
  observacion = signal('');
  error = signal<string | null>(null);
  guardando = signal(false);

  constructor() {
    addIcons({ checkmarkCircleOutline, lockClosedOutline });
    // Si llega otra incidencia (o la recargada), se limpia la selección anterior
    effect(() => {
      this.incidencia();
      untracked(() => {
        this.destino.set(null);
        this.observacion.set('');
        this.error.set(null);
      });
    });
  }

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
    if (destino === 'resuelta') {
      if (obs.length < 5) {
        this.error.set('Para marcarla como resuelta, la observación es obligatoria (mínimo 5 caracteres).');
        return;
      }
      // Resuelta es irreversible: se pide confirmación explícita
      if (!(await this.confirmarCierre())) return;
    }

    this.guardando.set(true);
    this.error.set(null);
    try {
      const resultado = await firstValueFrom(
        this.svc.actualizar({
          ...this.incidencia(),
          estado: destino,
          observacion: destino === 'resuelta' ? obs : this.incidencia().observacion ?? '',
        })
      );
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

  private async confirmarCierre(): Promise<boolean> {
    const a = await this.alert.create({
      header: 'Marcar como resuelta',
      message: 'Este es un estado final: después no podrá volver a pendiente ni a en proceso. ¿Continuar?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Resolver', role: 'confirm' },
      ],
    });
    await a.present();
    const { role } = await a.onDidDismiss();
    return role === 'confirm';
  }
}
