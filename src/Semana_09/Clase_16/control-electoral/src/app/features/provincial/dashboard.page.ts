import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonBadge,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonRefresher,
  IonRefresherContent,
  IonSegment,
  IonSegmentButton,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToggle,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { logOutOutline, refreshOutline } from 'ionicons/icons';
import { AuthService } from '../../core/auth/auth.service';
import { mapearError } from '../../core/errors/supabase-error.mapper';
import {
  DashboardRepository,
  ResultadoCandidato,
  TotalesBlancosNulos,
} from '../../data/repositories/dashboard.repository';
import { RecintosRepository } from '../../data/repositories/recintos.repository';
import type { Dignidad } from '../../domain/models/acta';
import type { Estado } from '../../domain/models/estado';
import type { Recinto } from '../../domain/models/recinto';
import { EstadoVistaComponent } from '../../shared/components/estado-vista.component';

interface DatosDashboard {
  resultados: ResultadoCandidato[];
  totales: TotalesBlancosNulos;
}

@Component({
  selector: 'app-dashboard',
  imports: [
    DatePipe,
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
    IonSelect,
    IonSelectOption,
    IonToggle,
    IonCard,
    IonCardContent,
    IonBadge,
    IonNote,
    EstadoVistaComponent,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Dashboard</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="cargar()" aria-label="Refrescar"><ion-icon slot="icon-only" name="refresh-outline"></ion-icon></ion-button>
          <ion-button (click)="salir()" aria-label="Cerrar sesión"><ion-icon slot="icon-only" name="log-out-outline"></ion-icon></ion-button>
        </ion-buttons>
      </ion-toolbar>
      <ion-toolbar>
        <ion-segment [value]="dignidad()" (ionChange)="cambiarDignidad($any($event).detail.value)">
          <ion-segment-button value="alcalde"><ion-label>Alcaldía</ion-label></ion-segment-button>
          <ion-segment-button value="prefecto"><ion-label>Prefectura</ion-label></ion-segment-button>
        </ion-segment>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-refresher slot="fixed" (ionRefresh)="cargar($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <ion-list>
        <ion-item>
          <ion-select label="Recinto" [value]="recintoId()" (ionChange)="cambiarRecinto($any($event).detail.value)">
            <ion-select-option value="">Consolidado</ion-select-option>
            @for (r of recintos(); track r.id) {
              <ion-select-option [value]="r.id">{{ r.nombre }}</ion-select-option>
            }
          </ion-select>
        </ion-item>
        <ion-item>
          <ion-toggle [checked]="excluirObservadas()" (ionChange)="excluirObservadas.set($any($event).detail.checked)">
            Excluir actas observadas
          </ion-toggle>
        </ion-item>
      </ion-list>

      <app-estado-vista [estado]="estado()" mensajeVacio="Aún no hay actas registradas.">
        @if (actasObservadas() > 0) {
          <div class="ion-padding-horizontal">
            <ion-badge color="danger">
              {{ excluirObservadas() ? 'Excluidas' : 'Incluye' }} {{ actasObservadas() }} actas observadas
            </ion-badge>
          </div>
        }

        <ion-card>
          <ion-card-content>
            @for (f of filas(); track f.candidaturaId) {
              <div class="fila">
                <div class="nombre">{{ f.lista }} · {{ f.candidato }}<small>{{ f.organizacion }}</small></div>
                <div class="barra-fondo">
                  <div class="barra" [style.width.%]="porcentajeBarra(f.votos)"></div>
                </div>
                <div class="valor">{{ f.votos }}</div>
              </div>
            }
          </ion-card-content>
        </ion-card>

        <ion-card>
          <ion-card-content>
            <table>
              <thead>
                <tr><th>Candidatura</th><th>Votos</th><th>%</th></tr>
              </thead>
              <tbody>
                @for (f of filas(); track f.candidaturaId) {
                  <tr>
                    <td>{{ f.lista }} · {{ f.candidato }}</td>
                    <td>{{ f.votos }}</td>
                    <td>{{ porcentajeValidos(f.votos) }}</td>
                  </tr>
                }
                <tr><td>Blancos</td><td>{{ totales().blancos }}</td><td></td></tr>
                <tr><td>Nulos</td><td>{{ totales().nulos }}</td><td></td></tr>
                <tr class="total"><td>Total de sufragantes</td><td>{{ totales().sufragantes }}</td><td></td></tr>
              </tbody>
            </table>
          </ion-card-content>
        </ion-card>

        @if (actualizado(); as hora) {
          <ion-note class="ion-padding">Última actualización: {{ hora | date: 'HH:mm:ss' }}</ion-note>
        }
      </app-estado-vista>
    </ion-content>
  `,
  styles: `
    .fila {
      display: grid;
      grid-template-columns: 40% 1fr 3.5rem;
      align-items: center;
      gap: 8px;
      margin-bottom: 10px;
    }
    .nombre {
      font-size: 0.85rem;
      display: flex;
      flex-direction: column;
    }
    .nombre small {
      color: var(--ion-color-medium);
    }
    .barra-fondo {
      background: var(--ion-color-light);
      border-radius: 4px;
      height: 18px;
      overflow: hidden;
    }
    .barra {
      background: var(--ion-color-primary);
      height: 100%;
      transition: width 0.4s;
    }
    .valor {
      text-align: right;
      font-weight: 600;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th,
    td {
      text-align: left;
      padding: 6px 4px;
      border-bottom: 1px solid var(--ion-color-light);
    }
    .total td {
      font-weight: 700;
    }
  `,
})
export class DashboardPage {
  private readonly auth = inject(AuthService);
  private readonly repo = inject(DashboardRepository);
  private readonly recintosRepo = inject(RecintosRepository);
  private readonly router = inject(Router);

  readonly dignidad = signal<Dignidad>('alcalde');
  readonly recintoId = signal<string>('');
  readonly excluirObservadas = signal(false);
  readonly recintos = signal<Recinto[]>([]);
  readonly estado = signal<Estado<DatosDashboard>>({ tipo: 'inactivo' });
  readonly datos = signal<DatosDashboard | null>(null);
  readonly actualizado = signal<Date | null>(null);

  readonly filas = computed(() =>
    (this.datos()?.resultados ?? []).map((r) => ({
      ...r,
      votos: this.excluirObservadas() ? r.votosSinObservadas : r.votosTotales,
    })),
  );

  readonly totales = computed(() => {
    const t = this.datos()?.totales;
    if (!t) return { blancos: 0, nulos: 0, sufragantes: 0 };
    return this.excluirObservadas()
      ? { blancos: t.blancosSinObservadas, nulos: t.nulosSinObservadas, sufragantes: t.sufragantesSinObservadas }
      : { blancos: t.blancos, nulos: t.nulos, sufragantes: t.sufragantes };
  });

  readonly actasObservadas = computed(() => this.datos()?.totales.actasObservadas ?? 0);
  private readonly maximo = computed(() => Math.max(1, ...this.filas().map((f) => f.votos)));
  private readonly totalValidos = computed(() => this.filas().reduce((s, f) => s + f.votos, 0));

  constructor() {
    addIcons({ logOutOutline, refreshOutline });
  }

  async ionViewWillEnter(): Promise<void> {
    try {
      this.recintos.set(await this.recintosRepo.listar());
    } catch {
      // el error se muestra al cargar los resultados
    }
    await this.cargar();
  }

  async cargar(evento?: CustomEvent): Promise<void> {
    if (!this.datos()) this.estado.set({ tipo: 'cargando' });
    try {
      const recinto = this.recintoId() || null;
      const [resultados, totales] = await Promise.all([
        this.repo.resultados(this.dignidad(), recinto),
        this.repo.blancosNulos(this.dignidad(), recinto),
      ]);
      const datos = { resultados, totales };
      this.datos.set(datos);
      this.actualizado.set(new Date());
      this.estado.set(totales.sufragantes > 0 ? { tipo: 'exito', datos } : { tipo: 'vacio' });
    } catch (e) {
      this.estado.set({ tipo: 'error', error: mapearError(e), reintentar: () => this.cargar() });
    } finally {
      (evento?.target as HTMLIonRefresherElement | undefined)?.complete();
    }
  }

  cambiarDignidad(d: Dignidad): void {
    this.dignidad.set(d);
    this.datos.set(null);
    void this.cargar();
  }

  cambiarRecinto(id: string): void {
    this.recintoId.set(id ?? '');
    this.datos.set(null);
    void this.cargar();
  }

  porcentajeBarra(votos: number): number {
    return (votos / this.maximo()) * 100;
  }

  porcentajeValidos(votos: number): string {
    const total = this.totalValidos();
    return total ? `${((votos / total) * 100).toFixed(1)} %` : '0 %';
  }

  async salir(): Promise<void> {
    await this.auth.cerrarSesion();
    await this.router.navigateByUrl('/auth/login', { replaceUrl: true });
  }
}
