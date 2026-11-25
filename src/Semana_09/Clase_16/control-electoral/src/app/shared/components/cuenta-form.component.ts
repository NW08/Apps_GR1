import { Component, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonButton, IonInput, IonItem, IonList, IonNote, IonSpinner } from '@ionic/angular';
import type { NuevaCuenta } from '../../domain/models/perfil';
import { cedulaEcuatoriana, telefonoCelular } from '../validators/cedula.validator';

@Component({
  selector: 'app-cuenta-form',
  imports: [ReactiveFormsModule, IonList, IonItem, IonInput, IonNote, IonButton, IonSpinner],
  template: `
    <form [formGroup]="form" (ngSubmit)="guardar()">
      <ion-list>
        <ion-item>
          <ion-input label="Cédula" labelPlacement="stacked" formControlName="cedula" inputmode="numeric" maxlength="10"></ion-input>
        </ion-item>
        @if (mostrar('cedula')) {
          <ion-note color="danger" class="error">Cédula ecuatoriana no válida.</ion-note>
        }
        <ion-item>
          <ion-input label="Nombres" labelPlacement="stacked" formControlName="nombres"></ion-input>
        </ion-item>
        @if (mostrar('nombres')) {
          <ion-note color="danger" class="error">Ingrese los nombres.</ion-note>
        }
        <ion-item>
          <ion-input label="Apellidos" labelPlacement="stacked" formControlName="apellidos"></ion-input>
        </ion-item>
        @if (mostrar('apellidos')) {
          <ion-note color="danger" class="error">Ingrese los apellidos.</ion-note>
        }
        <ion-item>
          <ion-input label="Teléfono celular" labelPlacement="stacked" formControlName="telefono" inputmode="tel" maxlength="10"></ion-input>
        </ion-item>
        @if (mostrar('telefono')) {
          <ion-note color="danger" class="error">Celular de 10 dígitos que empiece por 09.</ion-note>
        }
        <ion-item>
          <ion-input label="Correo" labelPlacement="stacked" formControlName="email" type="email" inputmode="email"></ion-input>
        </ion-item>
        @if (mostrar('email')) {
          <ion-note color="danger" class="error">Correo no válido.</ion-note>
        }
      </ion-list>
      <ion-button expand="block" type="submit" [disabled]="guardando()">
        @if (guardando()) {
          <ion-spinner name="crescent"></ion-spinner>
        } @else {
          {{ textoBoton() }}
        }
      </ion-button>
    </form>
  `,
  styles: `
    .error {
      display: block;
      padding: 4px 16px 8px;
      font-size: 0.8rem;
    }
  `,
})
export class CuentaFormComponent {
  readonly guardando = input(false);
  readonly textoBoton = input('Crear cuenta');
  readonly enviar = output<NuevaCuenta>();

  private readonly fb = inject(FormBuilder).nonNullable;
  readonly form = this.fb.group({
    cedula: ['', [Validators.required, cedulaEcuatoriana]],
    nombres: ['', [Validators.required, Validators.minLength(2)]],
    apellidos: ['', [Validators.required, Validators.minLength(2)]],
    telefono: ['', [Validators.required, telefonoCelular]],
    email: ['', [Validators.required, Validators.email, Validators.pattern(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)]],
  });

  mostrar(campo: keyof typeof this.form.controls): boolean {
    const c = this.form.controls[campo];
    return c.invalid && (c.touched || c.dirty);
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.enviar.emit({
      cedula: v.cedula.trim(),
      nombres: v.nombres.trim(),
      apellidos: v.apellidos.trim(),
      telefono: v.telefono.trim(),
      email: v.email.trim().toLowerCase(),
    });
  }

  reiniciar(): void {
    this.form.reset();
  }
}
