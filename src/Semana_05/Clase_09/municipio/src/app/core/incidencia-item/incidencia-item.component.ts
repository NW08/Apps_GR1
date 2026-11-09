import { Component, inject, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IonBadge, IonButton, IonIcon, IonItem, IonLabel, IonThumbnail } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  bulbOutline,
  constructOutline,
  leafOutline,
  star,
  starOutline,
  warningOutline,
  waterOutline,
} from 'ionicons/icons';
import { Incidencia } from '../models/incidencia.model';
import { SeguimientoService } from '../services/seguimiento.service';
import { COLOR_ESTADO, ETIQUETA_ESTADO, ETIQUETA_TIPO, ICONO_TIPO } from '../utils/estados';

/** Tarjeta de incidencia reutilizada en el listado y en seguimiento. Al tocarla abre el detalle. */
@Component({
  selector: 'app-incidencia-item',
  standalone: true,
  imports: [RouterLink, DatePipe, IonItem, IonThumbnail, IonLabel, IonBadge, IonButton, IonIcon],
  template: `
    @let i = incidencia();
    <ion-item [routerLink]="['/incidencias', i.id]" [detail]="false" lines="none">
      <ion-thumbnail slot="start">
        @if (i.fotoUrl) {
          <img [src]="i.fotoUrl" [alt]="'Foto de ' + i.codigo" loading="lazy" />
        } @else {
          <ion-icon [name]="icono(i)"></ion-icon>
        }
      </ion-thumbnail>

      <ion-label>
        <div class="fila">
          <span class="codigo">{{ i.codigo }}</span>
          <ion-badge [color]="colorEstado(i)">{{ etiquetaEstado(i) }}</ion-badge>
        </div>
        <h2>{{ tipo(i) }}</h2>
        <p class="desc">{{ i.descripcion }}</p>
        <p class="meta">
          {{ i.sector }} · {{ i.fecha | date: 'dd/MM/yyyy' }}
          @if (i.prioridad === 'alta') {
            · <span class="alta">Prioridad alta</span>
          }
        </p>
      </ion-label>

      <ion-button
        slot="end"
        fill="clear"
        [color]="seg.esMarcado(i.codigo) ? 'warning' : 'medium'"
        [attr.aria-label]="seg.esMarcado(i.codigo) ? 'Quitar de seguimiento' : 'Marcar para seguimiento'"
        (click)="alternar($event)"
      >
        <ion-icon slot="icon-only" [name]="seg.esMarcado(i.codigo) ? 'star' : 'star-outline'"></ion-icon>
      </ion-button>
    </ion-item>
  `,
  styles: [
    `
      ion-item {
        --background: var(--ion-item-background, #fff);
        --padding-start: 12px;
        --inner-padding-end: 4px;
        margin: 8px 12px;
        border-radius: 14px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
        cursor: pointer;
      }
      ion-thumbnail {
        --size: 64px;
        --border-radius: 10px;
        display: grid;
        place-items: center;
        background: var(--ion-color-light);
        color: var(--ion-color-medium);
        font-size: 26px;
      }
      .fila {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
      }
      .codigo {
        font-size: 12px;
        color: var(--ion-color-medium);
      }
      h2 {
        font-weight: 600;
        margin: 2px 0;
      }
      .desc {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        white-space: normal;
      }
      .meta {
        font-size: 12px;
      }
      .alta {
        color: var(--ion-color-danger);
        font-weight: 600;
      }
    `,
  ],
})
export class IncidenciaItemComponent {
  readonly seg = inject(SeguimientoService);
  incidencia = input.required<Incidencia>();

  constructor() {
    addIcons({ star, starOutline, bulbOutline, constructOutline, warningOutline, waterOutline, leafOutline });
  }

  tipo(i: Incidencia) {
    return ETIQUETA_TIPO[i.tipo] ?? i.tipo;
  }
  icono(i: Incidencia) {
    return ICONO_TIPO[i.tipo] ?? 'alert-circle-outline';
  }
  etiquetaEstado(i: Incidencia) {
    return ETIQUETA_ESTADO[i.estado] ?? i.estado;
  }
  colorEstado(i: Incidencia) {
    return COLOR_ESTADO[i.estado] ?? 'medium';
  }

  alternar(ev: Event) {
    // Evita que el toque en la estrella abra el detalle
    ev.preventDefault();
    ev.stopPropagation();
    void this.seg.alternar(this.incidencia().codigo);
  }
}
