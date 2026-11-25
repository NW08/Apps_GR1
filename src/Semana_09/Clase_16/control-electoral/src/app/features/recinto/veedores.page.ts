import { Component, inject, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { logOutOutline } from 'ionicons/icons';
import { AuthService } from '../../core/auth/auth.service';
import { mapearError } from '../../core/errors/supabase-error.mapper';
import { ToastService } from '../../core/ui/toast.service';
import { CuentasApi } from '../../data/functions/cuentas.api';
import { PerfilesRepository } from '../../data/repositories/perfiles.repository';
import type { Estado } from '../../domain/models/estado';
import type { NuevaCuenta, Perfil } from '../../domain/models/perfil';
import { CuentaFormComponent } from '../../shared/components/cuenta-form.component';
import { EstadoVistaComponent } from '../../shared/components/estado-vista.component';

@Component({
  selector: 'app-veedores',
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonList,
    IonListHeader,
    IonItem,
    IonLabel,
    CuentaFormComponent,
    EstadoVistaComponent,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Veedores</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="salir()" aria-label="Cerrar sesión"><ion-icon slot="icon-only" name="log-out-outline"></ion-icon></ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-card>
        <ion-card-header><ion-card-title>Nuevo veedor</ion-card-title></ion-card-header>
        <ion-card-content>
          <p>La cuenta se crea con la contraseña inicial <strong>Ecuador2026</strong>, que deberá cambiar en su primer acceso.</p>
          <app-cuenta-form #formulario textoBoton="Crear veedor" [guardando]="guardando()" (enviar)="crear($event)"></app-cuenta-form>
        </ion-card-content>
      </ion-card>

      <ion-list>
        <ion-list-header>Veedores del recinto</ion-list-header>
        <app-estado-vista [estado]="estado()" mensajeVacio="Aún no hay veedores en este recinto.">
          @for (v of veedores(); track v.id) {
            <ion-item>
              <ion-label>
                <h2>{{ v.nombres }} {{ v.apellidos }}</h2>
                <p>Cédula {{ v.cedula }} · {{ v.telefono }}</p>
                <p>{{ v.email }}</p>
              </ion-label>
            </ion-item>
          }
        </app-estado-vista>
      </ion-list>
    </ion-content>
  `,
})
export class VeedoresPage {
  private readonly auth = inject(AuthService);
  private readonly perfilesRepo = inject(PerfilesRepository);
  private readonly cuentas = inject(CuentasApi);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly formulario = viewChild<CuentaFormComponent>('formulario');

  readonly estado = signal<Estado<Perfil[]>>({ tipo: 'inactivo' });
  readonly veedores = signal<Perfil[]>([]);
  readonly guardando = signal(false);

  constructor() {
    addIcons({ logOutOutline });
  }

  ionViewWillEnter(): void {
    void this.cargar();
  }

  async cargar(): Promise<void> {
    const recintoId = this.auth.perfil()?.recintoId;
    this.estado.set({ tipo: 'cargando' });
    try {
      if (!recintoId) throw { code: '42501', message: 'sin recinto' };
      const lista = await this.perfilesRepo.veedoresDeRecinto(recintoId);
      this.veedores.set(lista);
      this.estado.set(lista.length ? { tipo: 'exito', datos: lista } : { tipo: 'vacio' });
    } catch (e) {
      this.estado.set({ tipo: 'error', error: mapearError(e), reintentar: () => this.cargar() });
    }
  }

  async crear(datos: NuevaCuenta): Promise<void> {
    this.guardando.set(true);
    try {
      const r = await this.cuentas.crearVeedor(datos);
      await this.toast.exito(
        r.correoEnviado
          ? 'Veedor creado. Se envió el correo de confirmación.'
          : 'Veedor creado. No se pudo enviar el correo de confirmación.',
      );
      this.formulario()?.reiniciar();
      await this.cargar();
    } catch (e) {
      await this.toast.error(mapearError(e).mensaje);
    } finally {
      this.guardando.set(false);
    }
  }

  async salir(): Promise<void> {
    await this.auth.cerrarSesion();
    await this.router.navigateByUrl('/auth/login', { replaceUrl: true });
  }
}
