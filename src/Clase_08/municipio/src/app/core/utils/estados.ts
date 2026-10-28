export type Estado = 'pendiente' | 'en_proceso' | 'resuelta';

/** Única fuente de verdad de las transiciones permitidas */
export const TRANSICIONES: Record<Estado, Estado[]> = {
  pendiente: ['en_proceso', 'resuelta'],
  en_proceso: ['resuelta'],
  resuelta: [], // estado final: no puede volver atrás
};

export const ETIQUETA_ESTADO: Record<Estado, string> = {
  pendiente: 'Pendiente',
  en_proceso: 'En proceso',
  resuelta: 'Resuelta',
};

export const COLOR_ESTADO: Record<Estado, string> = {
  pendiente: 'danger',
  en_proceso: 'warning',
  resuelta: 'success',
};

export function puedeCambiar(de: Estado, a: Estado): boolean {
  return TRANSICIONES[de]?.includes(a) ?? false;
}