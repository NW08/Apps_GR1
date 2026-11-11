import { Component, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subscription, finalize } from 'rxjs';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonSpinner,
  IonButton,
  IonIcon,
  IonFab,
  IonFabButton,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonRefresher,
  IonRefresherContent,
  InfiniteScrollCustomEvent,
  RefresherCustomEvent,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { add, cloudOfflineOutline, documentTextOutline, refreshOutline, star } from 'ionicons/icons';
import { IncidenciasService } from '../../core/services/incidencias.service';
import { Incidencia } from '../../core/models/incidencia.model';
import { PAGE_SIZE } from '../../core/config';
import { IncidenciaItemComponent } from '../../core/incidencia-item/incidencia-item.component';

@Component({
  selector: 'app-incidencias',
  templateUrl: './incidencias.page.html',
  standalone: true,
  imports: [
    RouterLink,
    IncidenciaItemComponent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    IonSpinner,
    IonButton,
    IonIcon,
    IonFab,
    IonFabButton,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonRefresher,
    IonRefresherContent,
  ],
})
export class IncidenciasPage {
  private svc = inject(IncidenciasService);

  items = signal<Incidencia[]>([]);
  cargando = signal(false);
  fin = signal(false);
  error = signal(false);

  private page = 1;
  private versionCargada = -1;
  private peticion?: Subscription;

  constructor() {
    addIcons({ add, star, cloudOfflineOutline, documentTextOutline, refreshOutline });
    inject(DestroyRef).onDestroy(() => this.peticion?.unsubscribe());
  }

  // Solo recarga si hubo altas o cambios de estado: al volver del detalle se conserva el scroll
  ionViewWillEnter() {
    if (this.versionCargada !== this.svc.version()) this.recargar();
  }

  /** Reinicia la paginación descartando cualquier respuesta en curso. */
  recargar(ev?: RefresherCustomEvent) {
    this.peticion?.unsubscribe();
    this.page = 1;
    this.items.set([]);
    this.fin.set(false);
    this.error.set(false);
    this.versionCargada = this.svc.version();
    this.cargar(() => ev?.target.complete());
  }

  masItems(ev: InfiniteScrollCustomEvent) {
    this.cargar(() => ev.target.complete());
  }

  /** Reintenta la misma página sin perder lo que ya se cargó. */
  reintentar() {
    this.cargar();
  }

  private cargar(done?: () => void) {
    if (this.cargando() || this.fin()) {
      done?.();
      return;
    }
    this.cargando.set(true);
    this.error.set(false);

    this.peticion = this.svc
      .getPagina(this.page, PAGE_SIZE)
      .pipe(
        finalize(() => {
          this.cargando.set(false);
          done?.();
        })
      )
      .subscribe({
        next: (datos) => {
          const ids = new Set(this.items().map((i) => i.id));
          this.items.update((lista) => [...lista, ...datos.filter((d) => !ids.has(d.id))]);
          this.page++;
          if (datos.length < PAGE_SIZE) this.fin.set(true);
        },
        error: () => this.error.set(true),
      });
  }
}
