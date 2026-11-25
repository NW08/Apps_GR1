import { Component, ElementRef, OnDestroy, inject, signal, viewChild } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonBadge,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonProgressBar,
  IonRefresher,
  IonRefresherContent,
  IonSegment,
  IonSegmentButton,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { logOutOutline } from 'ionicons/icons';
import * as L from 'leaflet';
import { AuthService } from '../../core/auth/auth.service';
import { mapearError } from '../../core/errors/supabase-error.mapper';
import {
  ActaUbicacion,
  AvanceRecinto,
  DashboardRepository,
} from '../../data/repositories/dashboard.repository';
import type { Estado } from '../../domain/models/estado';
import { EstadoVistaComponent } from '../../shared/components/estado-vista.component';

interface DatosAvance {
  avance: AvanceRecinto[];
  actas: ActaUbicacion[];
}

const QUITO: L.LatLngTuple = [-0.1807, -78.4678];

@Component({
  selector: 'app-avance',
  imports: [
    DecimalPipe,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonRefresher,
    IonRefresherContent,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonList,
    IonItem,
    IonProgressBar,
    IonBadge,
    EstadoVistaComponent,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Avance y GPS</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="salir()" aria-label="Cerrar sesión"><ion-icon slot="icon-only" name="log-out-outline"></ion-icon></ion-button>
        </ion-buttons>
      </ion-toolbar>
      <ion-toolbar>
        <ion-segment [value]="vista()" (ionChange)="cambiarVista($any($event).detail.value)">
          <ion-segment-button value="avance"><ion-label>Avance</ion-label></ion-segment-button>
          <ion-segment-button value="mapa"><ion-label>Mapa GPS</ion-label></ion-segment-button>
        </ion-segment>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-refresher slot="fixed" (ionRefresh)="cargar($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>
      <app-estado-vista [estado]="estado()" mensajeVacio="No hay recintos registrados.">
        @if (vista() === 'avance') {
          <ion-list>
            @for (r of datos().avance; track r.recintoId) {
              <ion-item lines="full">
                <ion-label>
                  <h2>{{ r.recinto }}</h2>
                  <p>{{ r.parroquia }} · {{ r.totalJrv }} JRV</p>
                  <p>Alcaldía: {{ r.actasAlcalde }}/{{ r.totalJrv }}</p>
                  <ion-progress-bar [value]="r.totalJrv ? r.actasAlcalde / r.totalJrv : 0"></ion-progress-bar>
                  <p>Prefectura: {{ r.actasPrefecto }}/{{ r.totalJrv }}</p>
                  <ion-progress-bar color="secondary" [value]="r.totalJrv ? r.actasPrefecto / r.totalJrv : 0"></ion-progress-bar>
                  <div class="chips">
                    @if (r.actasObservadas) {
                      <ion-badge color="danger">{{ r.actasObservadas }} observadas</ion-badge>
                    }
                    @if (r.actasSinUbicacion) {
                      <ion-badge color="warning">{{ r.actasSinUbicacion }} sin ubicación</ion-badge>
                    }
                  </div>
                </ion-label>
              </ion-item>
            }
          </ion-list>
        }
      </app-estado-vista>

      <!-- Siempre en el DOM para no reiniciar Leaflet al cambiar de segmento. -->
      <div #mapa class="mapa" [class.oculto]="vista() !== 'mapa' || estado().tipo !== 'exito'"></div>

      @if (vista() === 'mapa' && estado().tipo === 'exito') {
        <ion-list>
          @for (a of datos().actas; track a.id) {
            <ion-item lines="full">
              <ion-label>
                <h2>{{ a.recinto }} · JRV {{ a.mesa }} · {{ a.dignidad }}</h2>
                @if (a.ubicacionComprobable) {
                  <p>{{ a.lat | number: '1.5-5' }}, {{ a.lng | number: '1.5-5' }} · ±{{ a.precisionM | number: '1.0-0' }} m</p>
                  <a [href]="enlace(a)" target="_blank" rel="noopener">Ver en OpenStreetMap</a>
                } @else {
                  <ion-badge color="warning">Ubicación no comprobable</ion-badge>
                }
              </ion-label>
              @if (a.estado === 'OBSERVADA') {
                <ion-badge slot="end" color="danger">OBSERVADA</ion-badge>
              }
            </ion-item>
          } @empty {
            <ion-item><ion-label>Aún no hay actas registradas.</ion-label></ion-item>
          }
        </ion-list>
      }
    </ion-content>
  `,
  styles: `
    .mapa {
      height: 45vh;
      width: 100%;
    }
    .oculto {
      display: none;
    }
    .chips {
      display: flex;
      gap: 6px;
      margin-top: 6px;
    }
  `,
})
export class AvancePage implements OnDestroy {
  private readonly auth = inject(AuthService);
  private readonly repo = inject(DashboardRepository);
  private readonly router = inject(Router);
  private readonly contenedor = viewChild.required<ElementRef<HTMLDivElement>>('mapa');

  readonly vista = signal<'avance' | 'mapa'>('avance');
  readonly estado = signal<Estado<DatosAvance>>({ tipo: 'inactivo' });
  readonly datos = signal<DatosAvance>({ avance: [], actas: [] });

  private mapa: L.Map | null = null;
  private capa: L.LayerGroup | null = null;

  constructor() {
    addIcons({ logOutOutline });
  }

  ionViewWillEnter(): void {
    void this.cargar();
  }

  async cargar(evento?: CustomEvent): Promise<void> {
    if (!this.datos().avance.length) this.estado.set({ tipo: 'cargando' });
    try {
      const [avance, actas] = await Promise.all([this.repo.avance(), this.repo.actasConUbicacion()]);
      const datos = { avance, actas };
      this.datos.set(datos);
      this.estado.set(avance.length ? { tipo: 'exito', datos } : { tipo: 'vacio' });
      this.pintarMarcadores();
    } catch (e) {
      this.estado.set({ tipo: 'error', error: mapearError(e), reintentar: () => this.cargar() });
    } finally {
      (evento?.target as HTMLIonRefresherElement | undefined)?.complete();
    }
  }

  cambiarVista(valor: 'avance' | 'mapa'): void {
    this.vista.set(valor);
    if (valor === 'mapa') {
      // Leaflet necesita el contenedor visible para medirlo.
      setTimeout(() => {
        this.iniciarMapa();
        this.mapa?.invalidateSize();
        this.pintarMarcadores();
      }, 50);
    }
  }

  private iniciarMapa(): void {
    if (this.mapa) return;
    this.mapa = L.map(this.contenedor().nativeElement).setView(QUITO, 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.mapa);
    this.capa = L.layerGroup().addTo(this.mapa);
  }

  private pintarMarcadores(): void {
    if (!this.mapa || !this.capa) return;
    this.capa.clearLayers();
    for (const a of this.datos().actas) {
      if (!a.ubicacionComprobable || a.lat == null || a.lng == null) continue;
      L.circleMarker([a.lat, a.lng], {
        radius: 8,
        color: a.estado === 'OBSERVADA' ? '#c5000f' : '#3171e0',
        fillOpacity: 0.7,
      })
        .bindPopup(`${a.recinto} · JRV ${a.mesa} · ${a.dignidad}`)
        .addTo(this.capa);
    }
  }

  enlace(a: ActaUbicacion): string {
    return `https://www.openstreetmap.org/?mlat=${a.lat}&mlon=${a.lng}#map=18/${a.lat}/${a.lng}`;
  }

  ngOnDestroy(): void {
    this.mapa?.remove();
    this.mapa = null;
  }

  async salir(): Promise<void> {
    await this.auth.cerrarSesion();
    await this.router.navigateByUrl('/auth/login', { replaceUrl: true });
  }
}
