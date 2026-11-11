import type { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Fecha local de hoy en formato YYYY-MM-DD (evita el desfase de toISOString en UTC). */
export function hoyISO(): string {
  const ahora = new Date();
  const offsetMs = ahora.getTimezoneOffset() * 60_000;
  return new Date(ahora.getTime() - offsetMs).toISOString().slice(0, 10);
}

/** Extrae la parte YYYY-MM-DD de un valor de ion-datetime. */
export function soloFecha(valor: unknown): string {
  return typeof valor === 'string' ? valor.split('T')[0] : '';
}

function vacio(valor: unknown): boolean {
  return valor === null || valor === undefined || valor === '';
}

/** Longitud mínima ignorando espacios al inicio y al final. */
export function textoMinimo(min: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const largo = String(control.value ?? '').trim().length;
    return largo >= min ? null : { textoMinimo: { requerido: min, actual: largo } };
  };
}

/** Teléfono de 7 a 15 dígitos, con prefijo + opcional; se permiten espacios y guiones. */
export const telefonoValido: ValidatorFn = (control) => {
  if (vacio(control.value)) return null;
  const limpio = String(control.value).replace(/[\s-]/g, '');
  return /^\+?\d{7,15}$/.test(limpio) ? null : { telefono: true };
};

/** La fecha no puede ser posterior a hoy. */
export const fechaNoFutura: ValidatorFn = (control) => {
  const fecha = soloFecha(control.value);
  return !fecha || fecha <= hoyISO() ? null : { fechaFutura: true };
};

/** La fecha no puede ser anterior a hoy. */
export const fechaDesdeHoy: ValidatorFn = (control) => {
  const fecha = soloFecha(control.value);
  return !fecha || fecha >= hoyISO() ? null : { fechaPasada: true };
};

/** El valor debe ser un número entero. */
export const entero: ValidatorFn = (control) => {
  if (vacio(control.value)) return null;
  return Number.isInteger(Number(control.value)) ? null : { entero: true };
};

/** El valor debe ser estrictamente mayor que 0. */
export const mayorQueCero: ValidatorFn = (control) => {
  if (vacio(control.value)) return null;
  const numero = Number(control.value);
  return Number.isFinite(numero) && numero > 0 ? null : { mayorQueCero: true };
};
