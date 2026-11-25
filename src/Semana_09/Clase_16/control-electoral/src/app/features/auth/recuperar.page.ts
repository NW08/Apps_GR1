import { Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonButton, IonContent, IonIcon, IonInput, IonSpinner } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { mailOutline } from 'ionicons/icons';
import { AuthService } from '../../core/auth/auth.service';
import { mapearError } from '../../core/errors/supabase-error.mapper';

@Component({
  selector: 'app-recuperar',
  imports: [ReactiveFormsModule, RouterLink, IonContent, IonInput, IonButton, IonSpinner, IonIcon],
  template: `
    <ion-content class="auth-content" [fullscreen]="true">
      <main class="auth-escena">
        <section class="auth-tarjeta">
          <div class="auth-marca"><ion-icon name="mail-outline"></ion-icon></div>
          <h1>Recuperar contraseña</h1>
          @if (enviado()) {
            <p class="auth-sub">
              Si el correo está registrado, recibirá un enlace para restablecer su contraseña. Revise también la carpeta de spam.
            </p>
          } @else {
            <p class="auth-sub">Ingrese el correo registrado en su cuenta.</p>
            <form (ngSubmit)="enviar()" novalidate>
              <ion-input
                class="auth-campo"
                fill="outline"
                label="Correo electrónico"
                labelPlacement="floating"
                type="email"
                [formControl]="correo"
                errorText="Ingrese un correo válido"
                [class.ion-invalid]="correo.invalid && correo.touched"
                [class.ion-touched]="correo.touched"
              ></ion-input>
              @if (error()) {
                <p class="auth-error" role="alert">{{ error() }}</p>
              }
              <ion-button class="auth-boton" expand="block" type="submit" [disabled]="cargando()">
                @if (cargando()) {
                  <ion-spinner name="dots"></ion-spinner>
                } @else {
                  Enviar enlace
                }
              </ion-button>
            </form>
          }
          <a class="auth-enlace" routerLink="/auth/login">Volver al inicio de sesión</a>
        </section>
      </main>
    </ion-content>
  `,
})
export class RecuperarPage {
  private readonly auth = inject(AuthService);

  protected readonly correo = new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] });
  protected readonly cargando = signal(false);
  protected readonly enviado = signal(false);
  protected readonly error = signal<string | null>(null);

  constructor() {
    addIcons({ mailOutline });
  }

  async enviar(): Promise<void> {
    this.error.set(null);
    if (this.correo.invalid) {
      this.correo.markAsTouched();
      return;
    }
    this.cargando.set(true);
    try {
      await this.auth.recuperar(this.correo.value);
      this.enviado.set(true);
    } catch (e) {
      this.error.set(mapearError(e).mensaje);
    } finally {
      this.cargando.set(false);
    }
  }
}
