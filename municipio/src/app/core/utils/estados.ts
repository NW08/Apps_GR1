import type { Estado, Prioridad, TipoIncidencia } from '../models/incidencia.model';

export type { Estado } from '../models/incidencia.model';

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

/** Colores únicos para toda la app (listas, detalle, inicio y cambio de estado) */
export const COLOR_ESTADO: Record<Estado, string> = {
  pendiente: 'danger',
  en_proceso: 'warning',
  resuelta: 'success',
};

export const ETIQUETA_TIPO: Record<TipoIncidencia, string> = {
  luminaria: 'Luminaria dañada',
  bache: 'Bache',
  senalizacion: 'Señalización deteriorada',
  alcantarilla: 'Alcantarilla obstruida',
  parque: 'Daño en parque',
};

export const ICONO_TIPO: Record<TipoIncidencia, string> = {
  luminaria: 'bulb-outline',
  bache: 'construct-outline',
  senalizacion: 'warning-outline',
  alcantarilla: 'water-outline',
  parque: 'leaf-outline',
};

export const ETIQUETA_PRIORIDAD: Record<Prioridad, string> = {
  baja: 'Baja',
  media: 'Media',
  alta: 'Alta',
};

export const COLOR_PRIORIDAD: Record<Prioridad, string> = {
  baja: 'medium',
  media: 'tertiary',
  alta: 'danger',
};

export function puedeCambiar(de: Estado, a: Estado): boolean {
  return TRANSICIONES[de]?.includes(a) ?? false;
}
