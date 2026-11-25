export type EstadoMesa = 'PENDIENTE' | 'PARCIAL' | 'COMPLETA' | 'OBSERVADA';

export interface Mesa {
  id: string;
  recintoId: string;
  numero: number;
  veedorId: string | null;
  veedorNombre: string | null;
  actasRegistradas: number;
  estado: EstadoMesa;
}
