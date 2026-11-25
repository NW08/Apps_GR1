import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
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
  IonInput,
  IonItem,
  IonList,
  IonNote,
  IonRefresher,
  IonRefresherContent,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { addOutline, closeOutline, logOutOutline, personAddOutline } from 'ionicons/icons';
import { AuthService } from '../../core/auth/auth.service';
import { mapearError } from '../../core/errors/supabase-error.mapper';
import { ToastService } from '../../core/ui/toast.service';
import { CuentasApi } from '../../data/functions/cuentas.api';
import { RecintosRepository } from '../../data/repositories/recintos.repository';
import type { Estado } from '../../domain/models/estado';
import type { NuevaCuenta, Perfil } from '../../domain/models/perfil';
import type { Recinto } from '../../domain/models/recinto';
import { CuentaFormComponent } from '../../shared/components/cuenta-form.component';
import { EstadoVistaComponent } from '../../shared/components/estado-vista.component';

interface RecintoConCoordinador {
  recinto: Recinto;
  coordinador: Perfil | null;
}

@Component({
  selector: 'app-recintos',
  imports: [
    ReactiveFormsModule,
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
    IonList,
    IonItem,
    IonInput,
    IonNote,
    CuentaFormComponent,
    EstadoVistaComponent,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Recintos · Quito</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="mostrarNuevo.set(!mostrarNuevo())" aria-label="Nuevo recinto">
            <ion-icon slot="icon-only" [name]="mostrarNuevo() ? 'close-outline' : 'add-outline'"></ion-icon>
          </ion-button>
          <ion-button (click)="salir()" aria-label="Cerrar sesión"><ion-icon slot="icon-only" name="log-out-outline"></ion-icon></ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-refresher slot="fixed" (ionRefresh)="cargar($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      @if (mostrarNuevo()) {
        <ion-card>
          <ion-card-header><ion-card-title>Nuevo recinto</ion-card-title></ion-card-header>
          <ion-card-content>
            <form [formGroup]="form" (ngSubmit)="crearRecinto()">
              <ion-list>
                <ion-item><ion-input label="Parroquia" labelPlacement="stacked" formControlName="parroquia"></ion-input></ion-item>
                @if (invalido('parroquia')) {
                  <ion-note color="danger" class="error">Ingrese la parroquia.</ion-note>
                }
                <ion-item><ion-input label="Nombre del recinto" labelPlacement="stacked" formControlName="nombre"></ion-input></ion-item>
                @if (invalido('nombre')) {
                  <ion-note color="danger" class="error">Ingrese el nombre.</ion-note>
                }
                <ion-item><ion-input label="Número de JRV" labelPlacement="stacked" type="number" formControlName="numJrv"></ion-input></ion-item>
                @if (invalido('numJrv')) {
                  <ion-note color="danger" class="error">Entre 1 y 200 JRV.</ion-note>
                }
                <ion-item><ion-input label="Latitud (opcional)" labelPlacement="stacked" type="number" formControlName="lat"></ion-input></ion-item>
                <ion-item><ion-input label="Longitud (opcional)" labelPlacement="stacked" type="number" formControlName="lng"></ion-input></ion-item>
              </ion-list>
              <ion-button expand="block" type="submit" [disabled]="guardando()">Crear recinto</ion-button>
            </form>
          </ion-card-content>
        </ion-card>
      }

      <app-estado-vista [estado]="estado()" mensajeVacio="No hay recintos registrados.">
        @for (item of recintos(); track item.recinto.id) {
          <ion-card>
            <ion-card-header>
              <ion-card-title>{{ item.recinto.nombre }}</ion-card-title>
              <ion-card-subtitle>{{ item.recinto.parroquia }} · {{ item.recinto.numJrv }} JRV</ion-card-subtitle>
            </ion-card-header>
            <ion-card-content>
              @if (item.coordinador; as c) {
                <p><strong>Coordinador:</strong> {{ c.nombres }} {{ c.apellidos }} · {{ c.cedula }}</p>
              } @else {
                <p><strong>Sin coordinador</strong></p>
                @if (abierto() === item.recinto.id) {
                  <app-cuenta-form
                    textoBoton="Crear y asignar coordinador"
                    [guardando]="guardando()"
                    (enviar)="crearCoordinador(item.recinto, $event)"
                  ></app-cuenta-form>
                  <ion-button fill="clear" size="small" (click)="abierto.set(null)">Cancelar</ion-button>
                } @else {
                  <ion-button size="small" (click)="abierto.set(item.recinto.id)">
                    <ion-icon slot="start" name="person-add-outline"></ion-icon> Asignar coordinador
                  </ion-button>
                }
              }
            </ion-card-content>
          </ion-card>
        }
      </app-estado-vista>
    </ion-content>
  `,
  styles: `
    .error {
      display: block;
      padding: 4px 16px 8px;
      font-size: 0.8rem;
    }
  `,
})
export class RecintosPage {
  private readonly auth = inject(AuthService);
  private readonly repo = inject(RecintosRepository);
  private readonly cuentas = inject(CuentasApi);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder).nonNullable;

  readonly estado = signal<Estado<RecintoConCoordinador[]>>({ tipo: 'inactivo' });
  readonly recintos = signal<RecintoConCoordinador[]>([]);
  readonly mostrarNuevo = signal(false);
  readonly abierto = signal<string | null>(null);
  readonly guardando = signal(false);

  readonly form = this.fb.group({
    parroquia: ['', [Validators.required, Validators.minLength(2)]],
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    numJrv: [1, [Validators.required, Validators.min(1), Validators.max(200)]],
    lat: [null as number | null, [Validators.min(-90), Validators.max(90)]],
    lng: [null as number | null, [Validators.min(-180), Validators.max(180)]],
  });

  constructor() {
    addIcons({ addOutline, closeOutline, logOutOutline, personAddOutline });
  }

  ionViewWillEnter(): void {
    void this.cargar();
  }

  async cargar(evento?: CustomEvent): Promise<void> {
    if (!this.recintos().length) this.estado.set({ tipo: 'cargando' });
    try {
      const [recintos, coordinadores] = await Promise.all([this.repo.listar(), this.repo.coordinadores()]);
      const lista = recintos.map((recinto) => ({ recinto, coordinador: coordinadores.get(recinto.id) ?? null }));
      this.recintos.set(lista);
      this.estado.set(lista.length ? { tipo: 'exito', datos: lista } : { tipo: 'vacio' });
    } catch (e) {
      this.estado.set({ tipo: 'error', error: mapearError(e), reintentar: () => this.cargar() });
    } finally {
      (evento?.target as HTMLIonRefresherElement | undefined)?.complete();
    }
  }

  invalido(campo: keyof typeof this.form.controls): boolean {
    const c = this.form.controls[campo];
    return c.invalid && (c.touched || c.dirty);
  }

  async crearRecinto(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.guardando.set(true);
    try {
      await this.repo.crear({
        parroquia: v.parroquia.trim(),
        nombre: v.nombre.trim(),
        numJrv: Number(v.numJrv),
        lat: v.lat === null || (v.lat as unknown) === '' ? null : Number(v.lat),
        lng: v.lng === null || (v.lng as unknown) === '' ? null : Number(v.lng),
      });
      await this.toast.exito('Recinto creado con sus JRV.');
      this.form.reset();
      this.mostrarNuevo.set(false);
      await this.cargar();
    } catch (e) {
      await this.toast.error(mapearError(e).mensaje);
    } finally {
      this.guardando.set(false);
    }
  }

  async crearCoordinador(recinto: Recinto, datos: NuevaCuenta): Promise<void> {
    this.guardando.set(true);
    try {
      const r = await this.cuentas.crearCoordinador(datos, recinto.id);
      await this.toast.exito(
        `Coordinador asignado a ${recinto.nombre}. Clave inicial: Ecuador2026.` +
          (r.correoEnviado ? ' Se envió el correo de confirmación.' : ' No se pudo enviar el correo.'),
      );
      this.abierto.set(null);
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
