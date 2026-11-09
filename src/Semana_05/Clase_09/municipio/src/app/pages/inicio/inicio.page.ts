import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonSpinner,
  IonRefresher,
  IonRefresherContent,
  RefresherCustomEvent,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  addCircleOutline,
  chevronForward,
  cloudOfflineOutline,
  listOutline,
  refreshOutline,
  starOutline,
} from 'ionicons/icons';
import { Incidencia } from '../../core/models/incidencia.model';
import { IncidenciasService } from '../../core/services/incidencias.service';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
  standalone: true,
  imports: [
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
    IonSpinner,
    IonRefresher,
    IonRefresherContent,
  ],
})
export class InicioPage {
  private svc = inject(IncidenciasService);

  datos = signal<Incidencia[] | null>(null);
  cargando = signal(false);
  error = signal(false);

  indicadores = computed(() => {
    const d = this.datos() ?? [];
    const contar = (f: (i: Incidencia) => boolean) => d.filter(f).length;
    return {
      total: d.length,
      pendientes: contar((i) => i.estado === 'pendiente'),
      enProceso: contar((i) => i.estado === 'en_proceso'),
      resueltas: contar((i) => i.estado === 'resuelta'),
      altaAbiertas: contar((i) => i.prioridad === 'alta' && i.estado !== 'resuelta'),
    };
  });

  /** Porcentaje de incidencias resueltas, para la barra de avance. */
  avance = computed(() => {
    const { total, resueltas } = this.indicadores();
    return total ? Math.round((resueltas / total) * 100) : 0;
  });

  constructor() {
    addIcons({ addCircleOutline, listOutline, starOutline, chevronForward, cloudOfflineOutline, refreshOutline });
  }

  // Se recarga cada vez que se vuelve al inicio: refleja altas y cambios de estado
  ionViewWillEnter() {
    void this.cargar();
  }

  async cargar(ev?: RefresherCustomEvent) {
    this.cargando.set(true);
    this.error.set(false);
    try {
      this.datos.set(await firstValueFrom(this.svc.resumen()));
    } catch {
      this.error.set(true);
    } finally {
      this.cargando.set(false);
      ev?.target.complete();
    }
  }
}
