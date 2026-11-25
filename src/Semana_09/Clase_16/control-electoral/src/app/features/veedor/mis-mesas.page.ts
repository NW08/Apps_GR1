import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  IonBadge,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonRefresher,
  IonRefresherContent,
  IonTitle,
  IonToolbar,
  ViewWillEnter,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { documentTextOutline, logOutOutline } from 'ionicons/icons';
import { AuthService } from '../../core/auth/auth.service';
import type { EstadoMesa } from '../../domain/models/mesa';
import { EstadoVistaComponent } from '../../shared/components/estado-vista.component';
import { VeedorMesasStore } from './veedor-mesas.store';

const COLOR_ESTADO: Record<EstadoMesa, string> = {
  PENDIENTE: 'medium',
  PARCIAL: 'warning',
  COMPLETA: 'success',
  OBSERVADA: 'danger',
};

@Component({
  selector: 'app-mis-mesas',
  imports: [
    RouterLink,
    EstadoVistaComponent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonRefresher,
    IonRefresherContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonBadge,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Mis mesas</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="salir()" aria-label="Cerrar sesión"><ion-icon slot="icon-only" name="log-out-outline"></ion-icon></ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-refresher slot="fixed" (ionRefresh)="refrescar($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>
      @if (nombre(); as n) {
        <p class="ion-padding-horizontal">Veedor: <strong>{{ n }}</strong></p>
      }
      <app-estado-vista [estado]="store.estado()" mensajeVacio="Aún no tiene mesas asignadas. Consulte a su coordinador de recinto.">
        @if (store.estado().tipo === 'exito') {
          @for (m of mesas(); track m.id) {
            <ion-card>
              <ion-card-header>
                <ion-card-title>JRV {{ m.numero }}</ion-card-title>
                <ion-card-subtitle>
                  <ion-badge [color]="color(m.estado)">{{ m.estado }}</ion-badge> · {{ m.actasRegistradas }}/2 actas
                </ion-card-subtitle>
              </ion-card-header>
              <ion-card-content>
                <ion-button size="small" [routerLink]="['/veedor/acta', m.id, 'alcalde']">
                  <ion-icon slot="start" name="document-text-outline"></ion-icon> Acta alcalde
                </ion-button>
                <ion-button size="small" fill="outline" [routerLink]="['/veedor/acta', m.id, 'prefecto']">
                  <ion-icon slot="start" name="document-text-outline"></ion-icon> Acta prefecto
                </ion-button>
              </ion-card-content>
            </ion-card>
          }
        }
      </app-estado-vista>
    </ion-content>
  `,
})
export class MisMesasPage implements ViewWillEnter {
  protected readonly store = inject(VeedorMesasStore);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly mesas = computed(() => {
    const e = this.store.estado();
    return e.tipo === 'exito' ? e.datos : [];
  });
  protected readonly nombre = computed(() => {
    const p = this.auth.perfil();
    return p ? `${p.nombres} ${p.apellidos}` : null;
  });

  constructor() {
    addIcons({ logOutOutline, documentTextOutline });
  }

  ionViewWillEnter(): void {
    void this.store.cargar(this.store.estado().tipo === 'exito');
  }

  protected color(e: EstadoMesa): string {
    return COLOR_ESTADO[e];
  }

  protected async refrescar(ev: CustomEvent): Promise<void> {
    await this.store.cargar(true);
    (ev.target as HTMLIonRefresherElement).complete();
  }

  protected async salir(): Promise<void> {
    await this.auth.cerrarSesion();
    await this.router.navigateByUrl('/auth/login', { replaceUrl: true });
  }
}
