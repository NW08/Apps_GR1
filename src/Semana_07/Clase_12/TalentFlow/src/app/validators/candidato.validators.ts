import type { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Fecha local de hoy (YYYY-MM-DD); toISOString() sola daría la fecha en UTC. */
export function hoyISO(): string {
  const ahora = new Date();
  const offsetMs = ahora.getTimezoneOffset() * 60_000;
  return new Date(ahora.getTime() - offsetMs).toISOString().slice(0, 10);
}

/** ion-datetime entrega un ISO con hora; se conserva solo YYYY-MM-DD. */
export function soloFecha(valor: unknown): string {
  return typeof valor === 'string' ? valor.split('T')[0] : '';
}

function vacio(valor: unknown): boolean {
  return valor === null || valor === undefined || valor === '';
}

export function textoMinimo(min: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const largo = String(control.value ?? '').trim().length;
    return largo >= min ? null : { textoMinimo: { requerido: min, actual: largo } };
  };
}

export function normalizarTelefono(valor: unknown): string {
  return String(valor ?? '').replace(/[\s-]/g, '');
}

export const telefonoValido: ValidatorFn = (control) => {
  if (vacio(control.value)) return null;
  return /^\d{10}$/.test(normalizarTelefono(control.value)) ? null : { telefono: true };
};

export const fechaNoFutura: ValidatorFn = (control) => {
  const fecha = soloFecha(control.value);
  return !fecha || fecha <= hoyISO() ? null : { fechaFutura: true };
};

export const fechaDesdeHoy: ValidatorFn = (control) => {
  const fecha = soloFecha(control.value);
  return !fecha || fecha >= hoyISO() ? null : { fechaPasada: true };
};

export const entero: ValidatorFn = (control) => {
  if (vacio(control.value)) return null;
  return Number.isInteger(Number(control.value)) ? null : { entero: true };
};

export const mayorQueCero: ValidatorFn = (control) => {
  if (vacio(control.value)) return null;
  const numero = Number(control.value);
  return Number.isFinite(numero) && numero > 0 ? null : { mayorQueCero: true };
};
