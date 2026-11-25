import type { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { esCedulaValida } from '../../domain/rules/cedula';

export const cedulaEcuatoriana: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const valor = String(control.value ?? '').trim();
  if (!valor) return null;
  return esCedulaValida(valor) ? null : { cedula: true };
};

export const telefonoCelular: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const valor = String(control.value ?? '').trim();
  if (!valor) return null;
  return /^09\d{8}$/.test(valor) ? null : { telefono: true };
};
