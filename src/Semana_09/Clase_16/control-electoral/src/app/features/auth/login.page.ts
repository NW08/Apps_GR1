import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonButton, IonContent, IonIcon, IonInput, IonInputPasswordToggle, IonSpinner } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { shieldCheckmarkOutline } from 'ionicons/icons';
import { AuthService } from '../../core/auth/auth.service';
import { mapearError } from '../../core/errors/supabase-error.mapper';
import { esCedulaValida } from '../../domain/rules/cedula';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, IonContent, IonInput, IonInputPasswordToggle, IonButton, IonSpinner, IonIcon],
  template: `
    <ion-content class="auth-content" [fullscreen]="true">
      <main class="auth-escena">
        <section class="auth-tarjeta">
          <div class="auth-marca"><ion-icon name="shield-checkmark-outline"></ion-icon></div>
          <h1>Control Electoral</h1>
          <p class="auth-sub">Ingrese con su número de cédula</p>

          <form [formGroup]="form" (ngSubmit)="ingresar()" novalidate>
            <ion-input
              class="auth-campo"
              fill="outline"
              label="Cédula"
              labelPlacement="floating"
              inputmode="numeric"
              maxlength="10"
              formControlName="cedula"
              [errorText]="errorCedula()"
              [class.ion-invalid]="form.controls.cedula.invalid && form.controls.cedula.touched"
              [class.ion-touched]="form.controls.cedula.touched"
            ></ion-input>

            <ion-input
              class="auth-campo"
              fill="outline"
              label="Contraseña"
              labelPlacement="floating"
              type="password"
              formControlName="clave"
              errorText="Ingrese su contraseña"
              [class.ion-invalid]="form.controls.clave.invalid && form.controls.clave.touched"
              [class.ion-touched]="form.controls.clave.touched"
            >
              <ion-input-password-toggle slot="end"></ion-input-password-toggle>
            </ion-input>

            @if (error()) {
              <p class="auth-error" role="alert">{{ error() }}</p>
            }

            <ion-button class="auth-boton" expand="block" type="submit" [disabled]="cargando()">
              @if (cargando()) {
                <ion-spinner name="dots"></ion-spinner>
              } @else {
                Ingresar
              }
            </ion-button>
          </form>

          <a class="auth-enlace" routerLink="/auth/recuperar">¿Olvidaste tu contraseña?</a>
          <p class="auth-nota">Sin autorregistro: las cuentas las crea su coordinador.</p>
        </section>
      </main>
    </ion-content>
  `,
})
export class LoginPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = new FormGroup({
    cedula: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, (c) => (esCedulaValida(c.value) ? null : { cedula: true })],
    }),
    clave: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  constructor() {
    addIcons({ shieldCheckmarkOutline });
  }

  protected errorCedula(): string {
    return this.form.controls.cedula.hasError('required') ? 'Ingrese su cédula' : 'Cédula ecuatoriana no válida';
  }

  async ingresar(): Promise<void> {
    this.error.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.cargando.set(true);
    try {
      const { cedula, clave } = this.form.getRawValue();
      await this.auth.iniciarSesion(cedula, clave);
      this.form.reset();
      await this.router.navigateByUrl(this.auth.rutaInicio(), { replaceUrl: true });
    } catch (e) {
      this.error.set(mapearError(e).mensaje);
    } finally {
      this.cargando.set(false);
    }
  }
}
