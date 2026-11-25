import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IonButton, IonContent, IonIcon, IonInput, IonInputPasswordToggle, IonSpinner } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { keyOutline } from 'ionicons/icons';
import { AuthService } from '../../core/auth/auth.service';
import { mapearError } from '../../core/errors/supabase-error.mapper';
import { ToastService } from '../../core/ui/toast.service';

export const CLAVE_INICIAL = 'Ecuador2026';
const MIN_CLAVE = 8;

function clavesValidas(g: AbstractControl): ValidationErrors | null {
  const nueva = g.get('nueva')?.value as string;
  const confirmacion = g.get('confirmacion')?.value as string;
  if (nueva === CLAVE_INICIAL) return { inicial: true };
  if (nueva && confirmacion && nueva !== confirmacion) return { noCoinciden: true };
  return null;
}

@Component({
  selector: 'app-cambiar-clave',
  imports: [ReactiveFormsModule, IonContent, IonInput, IonInputPasswordToggle, IonButton, IonSpinner, IonIcon],
  template: `
    <ion-content class="auth-content" [fullscreen]="true">
      <main class="auth-escena">
        <section class="auth-tarjeta">
          <div class="auth-marca"><ion-icon name="key-outline"></ion-icon></div>
          <h1>Nueva contraseña</h1>
          <p class="auth-sub">Por seguridad, reemplace la contraseña inicial antes de continuar.</p>

          <form [formGroup]="form" (ngSubmit)="guardar()" novalidate>
            <ion-input
              class="auth-campo"
              fill="outline"
              label="Nueva contraseña"
              labelPlacement="floating"
              type="password"
              formControlName="nueva"
            >
              <ion-input-password-toggle slot="end"></ion-input-password-toggle>
            </ion-input>

            <ion-input
              class="auth-campo"
              fill="outline"
              label="Confirmar contraseña"
              labelPlacement="floating"
              type="password"
              formControlName="confirmacion"
            >
              <ion-input-password-toggle slot="end"></ion-input-password-toggle>
            </ion-input>

            <ul class="auth-requisitos">
              <li [class.ok]="largoOk()">Al menos {{ minimo }} caracteres</li>
              <li [class.ok]="distintaOk()">Distinta de la contraseña inicial</li>
              <li [class.ok]="coincideOk()">Ambas contraseñas coinciden</li>
            </ul>

            @if (error()) {
              <p class="auth-error" role="alert">{{ error() }}</p>
            }

            <ion-button class="auth-boton" expand="block" type="submit" [disabled]="cargando()">
              @if (cargando()) {
                <ion-spinner name="dots"></ion-spinner>
              } @else {
                Guardar contraseña
              }
            </ion-button>
          </form>

          <ion-button class="auth-secundario" fill="clear" expand="block" (click)="salir()">Cerrar sesión</ion-button>
        </section>
      </main>
    </ion-content>
  `,
})
export class CambiarClavePage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly minimo = MIN_CLAVE;
  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = new FormGroup(
    {
      nueva: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(MIN_CLAVE)] }),
      confirmacion: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    },
    { validators: clavesValidas },
  );

  private readonly valores = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });
  protected readonly largoOk = computed(() => (this.valores().nueva ?? '').length >= MIN_CLAVE);
  protected readonly distintaOk = computed(() => !!this.valores().nueva && this.valores().nueva !== CLAVE_INICIAL);
  protected readonly coincideOk = computed(() => !!this.valores().nueva && this.valores().nueva === this.valores().confirmacion);

  constructor() {
    addIcons({ keyOutline });
  }

  async guardar(): Promise<void> {
    this.error.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set('Revise los requisitos de la contraseña.');
      return;
    }
    this.cargando.set(true);
    try {
      await this.auth.cambiarClave(this.form.getRawValue().nueva);
      await this.toast.exito('Contraseña actualizada.');
      await this.router.navigateByUrl(this.auth.rutaInicio(), { replaceUrl: true });
    } catch (e) {
      this.error.set(mapearError(e).mensaje);
    } finally {
      this.cargando.set(false);
    }
  }

  async salir(): Promise<void> {
    await this.auth.cerrarSesion();
    await this.router.navigateByUrl('/auth/login', { replaceUrl: true });
  }
}
