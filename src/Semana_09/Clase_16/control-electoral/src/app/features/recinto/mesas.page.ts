import { Component, inject, signal } from '@angular/core';
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
  IonRefresher,
  IonRefresherContent,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { logOutOutline } from 'ionicons/icons';
import { AuthService } from '../../core/auth/auth.service';
import { mapearError } from '../../core/errors/supabase-error.mapper';
import { ToastService } from '../../core/ui/toast.service';
import { MesasRepository } from '../../data/repositories/mesas.repository';
import { PerfilesRepository } from '../../data/repositories/perfiles.repository';
import type { Estado } from '../../domain/models/estado';
import type { EstadoMesa, Mesa } from '../../domain/models/mesa';
import type { Perfil } from '../../domain/models/perfil';
import { EstadoVistaComponent } from '../../shared/components/estado-vista.component';

const COLOR_ESTADO: Record<EstadoMesa, string> = {
  PENDIENTE: 'medium',
  PARCIAL: 'warning',
  COMPLETA: 'success',
  OBSERVADA: 'danger',
};

@Component({
  selector: 'app-mesas-recinto',
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonRefresher,
    IonRefresherContent,
    IonList,
    IonItem,
    IonLabel,
    IonBadge,
    IonSelect,
    IonSelectOption,
    EstadoVistaComponent,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Mesas del recinto</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="salir()" aria-label="Cerrar sesión"><ion-icon slot="icon-only" name="log-out-outline"></ion-icon></ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-refresher slot="fixed" (ionRefresh)="cargar($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>
      <app-estado-vista [estado]="estado()" mensajeVacio="Este recinto no tiene mesas.">
        <ion-list>
          @for (m of mesas(); track m.id) {
            <ion-item lines="full">
              <ion-label>
                <h2>JRV {{ m.numero }}</h2>
                <p>Actas registradas: {{ m.actasRegistradas }}/2</p>
                <ion-select
                  label="Veedor"
                  labelPlacement="stacked"
                  interface="action-sheet"
                  placeholder="Sin asignar"
                  [value]="m.veedorId ?? ''"
                  (ionChange)="asignar(m, $any($event).detail.value)"
                >
                  <ion-select-option value="">Sin asignar</ion-select-option>
                  @for (v of veedores(); track v.id) {
                    <ion-select-option [value]="v.id">{{ v.nombres }} {{ v.apellidos }}</ion-select-option>
                  }
                </ion-select>
                <div class="acciones">
                  <ion-button size="small" fill="outline" (click)="corregir(m, 'alcalde')">Corregir alcalde</ion-button>
                  <ion-button size="small" fill="outline" (click)="corregir(m, 'prefecto')">Corregir prefecto</ion-button>
                </div>
              </ion-label>
              <ion-badge slot="end" [color]="color(m.estado)">{{ m.estado }}</ion-badge>
            </ion-item>
          }
        </ion-list>
      </app-estado-vista>
    </ion-content>
  `,
  styles: `
    .acciones {
      display: flex;
      gap: 8px;
      margin-top: 6px;
    }
  `,
})
export class MesasRecintoPage {
  private readonly auth = inject(AuthService);
  private readonly mesasRepo = inject(MesasRepository);
  private readonly perfilesRepo = inject(PerfilesRepository);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  readonly estado = signal<Estado<Mesa[]>>({ tipo: 'inactivo' });
  readonly mesas = signal<Mesa[]>([]);
  readonly veedores = signal<Perfil[]>([]);

  constructor() {
    addIcons({ logOutOutline });
  }

  ionViewWillEnter(): void {
    void this.cargar();
  }

  async cargar(evento?: CustomEvent): Promise<void> {
    const recintoId = this.auth.perfil()?.recintoId;
    if (!this.mesas().length) this.estado.set({ tipo: 'cargando' });
    try {
      if (!recintoId) throw { code: '42501', message: 'sin recinto' };
      const [mesas, veedores] = await Promise.all([
        this.mesasRepo.listar(recintoId),
        this.perfilesRepo.veedoresDeRecinto(recintoId),
      ]);
      this.mesas.set(mesas);
      this.veedores.set(veedores);
      this.estado.set(mesas.length ? { tipo: 'exito', datos: mesas } : { tipo: 'vacio' });
    } catch (e) {
      this.estado.set({ tipo: 'error', error: mapearError(e), reintentar: () => this.cargar() });
    } finally {
      (evento?.target as HTMLIonRefresherElement | undefined)?.complete();
    }
  }

  // RLS rechaza veedores de otro recinto.
  async asignar(mesa: Mesa, veedorId: string): Promise<void> {
    const nuevo = veedorId || null;
    if (nuevo === mesa.veedorId) return;
    try {
      await this.mesasRepo.asignarVeedor(mesa.id, nuevo);
      await this.toast.exito(nuevo ? `Veedor asignado a la JRV ${mesa.numero}.` : `JRV ${mesa.numero} sin veedor.`);
      await this.cargar();
    } catch (e) {
      await this.toast.error(mapearError(e).mensaje);
      await this.cargar();
    }
  }

  corregir(mesa: Mesa, dignidad: 'alcalde' | 'prefecto'): void {
    void this.router.navigate(['/recinto/acta', mesa.id, dignidad]);
  }

  color(estado: EstadoMesa): string {
    return COLOR_ESTADO[estado];
  }

  async salir(): Promise<void> {
    await this.auth.cerrarSesion();
    await this.router.navigateByUrl('/auth/login', { replaceUrl: true });
  }
}
