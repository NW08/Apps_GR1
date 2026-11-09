import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { finalize } from 'rxjs';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonBadge,
  IonSpinner,
  IonRefresher,
  IonRefresherContent,
  RefresherCustomEvent,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  bulbOutline,
  calendarOutline,
  cloudOfflineOutline,
  constructOutline,
  leafOutline,
  locationOutline,
  mapOutline,
  navigateOutline,
  refreshOutline,
  star,
  starOutline,
  warningOutline,
  waterOutline,
} from 'ionicons/icons';
import { Incidencia } from '../../core/models/incidencia.model';
import { IncidenciasService } from '../../core/services/incidencias.service';
import { SeguimientoService } from '../../core/services/seguimiento.service';
import { coordenadasValidas } from '../../core/utils/coordenadas';
import {
  COLOR_ESTADO,
  COLOR_PRIORIDAD,
  ETIQUETA_ESTADO,
  ETIQUETA_PRIORIDAD,
  ETIQUETA_TIPO,
  ICONO_TIPO,
} from '../../core/utils/estados';
import { CambioEstadoComponent } from '../../core/estado/cambio-estado.component';
import { ClimaComponent } from '../../core/clima/clima.component';

@Component({
  selector: 'app-detalle',
  templateUrl: './detalle.page.html',
  styleUrls: ['./detalle.page.scss'],
  standalone: true,
  imports: [
    DatePipe,
    CambioEstadoComponent,
    ClimaComponent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    IonButton,
    IonIcon,
    IonBadge,
    IonSpinner,
    IonRefresher,
    IonRefresherContent,
  ],
})
export class DetallePage {
  private svc = inject(IncidenciasService);
  private sanitizer = inject(DomSanitizer);
  readonly seg = inject(SeguimientoService);

  private readonly id = inject(ActivatedRoute).snapshot.paramMap.get('id') ?? '';

  incidencia = signal<Incidencia | null>(null);
  cargando = signal(false);
  error = signal(false);

  /** Coordenadas válidas de la incidencia o null si no tiene ubicación. */
  coords = computed(() => {
    const i = this.incidencia();
    return i && coordenadasValidas(i.latitud, i.longitud)
      ? { lat: i.latitud as number, lon: i.longitud as number }
      : null;
  });

  mapaEmbebido = computed(() => {
    const c = this.coords();
    if (!c) return null;
    const d = 0.003;
    const url =
      'https://www.openstreetmap.org/export/embed.html' +
      `?bbox=${c.lon - d},${c.lat - d},${c.lon + d},${c.lat + d}&layer=mapnik&marker=${c.lat},${c.lon}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });

  enlaceMapa = computed(() => {
    const c = this.coords();
    return c ? `https://www.google.com/maps/search/?api=1&query=${c.lat},${c.lon}` : undefined;
  });

  constructor() {
    addIcons({
      star,
      starOutline,
      calendarOutline,
      locationOutline,
      mapOutline,
      navigateOutline,
      cloudOfflineOutline,
      refreshOutline,
      bulbOutline,
      constructOutline,
      warningOutline,
      waterOutline,
      leafOutline,
    });
    this.cargar();
  }

  cargar(ev?: RefresherCustomEvent) {
    if (!this.id) {
      this.error.set(true);
      ev?.target.complete();
      return;
    }
    this.cargando.set(true);
    this.error.set(false);
    this.svc
      .getPorId(this.id)
      .pipe(
        finalize(() => {
          this.cargando.set(false);
          ev?.target.complete();
        })
      )
      .subscribe({
        next: (i) => this.incidencia.set(i),
        error: () => this.error.set(true),
      });
  }

  /** El componente de estado devuelve la incidencia ya guardada en MockAPI. */
  onActualizada(i: Incidencia) {
    this.incidencia.set(i);
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
  etiquetaPrioridad(i: Incidencia) {
    return ETIQUETA_PRIORIDAD[i.prioridad] ?? i.prioridad;
  }
  colorPrioridad(i: Incidencia) {
    return COLOR_PRIORIDAD[i.prioridad] ?? 'medium';
  }
}
