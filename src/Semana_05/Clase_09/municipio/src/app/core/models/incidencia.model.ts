export type TipoIncidencia = 'luminaria' | 'bache' | 'senalizacion' | 'alcantarilla' | 'parque';
export type Prioridad = 'baja' | 'media' | 'alta';
export type Estado = 'pendiente' | 'en_proceso' | 'resuelta';

export interface Incidencia {
  id: string;
  codigo: string;
  tipo: TipoIncidencia;
  descripcion: string;
  direccion: string;
  sector: string;
  fecha: string;            // ISO
  estado: Estado;
  prioridad: Prioridad;
  fotoUrl: string | null;
  latitud: number | null;
  longitud: number | null;
  observacion: string;      // obligatoria al resolver (R9)
}

export type NuevaIncidencia = Omit<Incidencia, 'id'>;