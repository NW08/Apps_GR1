import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
  IonButton,
  IonIcon,
  IonSpinner,
  IonNote,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { addCircleOutline, listOutline, bookmarkOutline } from 'ionicons/icons';
import { Incidencia } from '../../core/models/incidencia.model';
import { IncidenciasService } from '../../core/services/incidencias.service';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardContent,
    IonButton,
    IonIcon,
    IonSpinner,
    IonNote,
    IonRefresher,
    IonRefresherContent,
  ],
  styles: [
    `
      .num {
        font-size: 2.2rem;
        font-weight: 700;
        line-height: 1.1;
      }
      .etq {
        font-size: 0.95rem;
      }
      ion-card {
        margin: 4px;
        text-align: center;
      }
      .acciones ion-button {
        margin-top: 10px;
      }
    `,
  ],
})
export class InicioPage {
  private svc = inject(IncidenciasService);
  private router = inject(Router);

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

  constructor() {
    addIcons({ addCircleOutline, listOutline, bookmarkOutline });
  }

  // Se recarga cada vez que se vuelve al inicio: refleja altas y cambios de estado
  ionViewWillEnter() {
    void this.cargar();
  }

  async cargar(ev?: Event) {
    this.cargando.set(true);
    this.error.set(false);
    try {
      this.datos.set(await firstValueFrom(this.svc.resumen()));
    } catch {
      this.error.set(true);
    } finally {
      this.cargando.set(false);
      (ev?.target as any)?.complete?.();
    }
  }

  ir(ruta: string) {
    this.router.navigate([ruta]); // ajusta si usas /tabs/...
  }
}
