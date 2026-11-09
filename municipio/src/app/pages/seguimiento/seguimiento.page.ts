import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
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
  IonRefresher,
  IonRefresherContent,
  RefresherCustomEvent,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { cloudOfflineOutline, refreshOutline, starOutline } from 'ionicons/icons';
import { IncidenciasService } from '../../core/services/incidencias.service';
import { SeguimientoService } from '../../core/services/seguimiento.service';
import { Incidencia } from '../../core/models/incidencia.model';
import { IncidenciaItemComponent } from '../../core/incidencia-item/incidencia-item.component';

@Component({
  selector: 'app-seguimiento',
  templateUrl: './seguimiento.page.html',
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
    IonRefresher,
    IonRefresherContent,
  ],
})
export class SeguimientoPage {
  private svc = inject(IncidenciasService);
  private seg = inject(SeguimientoService);

  private items = signal<Incidencia[]>([]);
  cargando = signal(false);
  error = signal(false);

  /** Al desmarcar la estrella en una tarjeta, desaparece de inmediato de esta lista. */
  visibles = computed(() => {
    const codigos = this.seg.codigos();
    return this.items().filter((i) => codigos.includes(i.codigo));
  });

  constructor() {
    addIcons({ starOutline, cloudOfflineOutline, refreshOutline });
  }

  // Se ejecuta cada vez que se entra a la página
  async ionViewWillEnter() {
    await this.seg.listo;
    this.cargar();
  }

  cargar(ev?: RefresherCustomEvent) {
    const codigos = this.seg.codigos();
    this.error.set(false);
    if (codigos.length === 0) {
      this.items.set([]);
      ev?.target.complete();
      return;
    }
    this.cargando.set(true);

    forkJoin(codigos.map((c) => this.svc.getPorCodigo(c)))
      .pipe(
        finalize(() => {
          this.cargando.set(false);
          ev?.target.complete();
        })
      )
      .subscribe({
        next: (res) => this.items.set(res.filter((x): x is Incidencia => x !== null)),
        error: () => this.error.set(true),
      });
  }
}
