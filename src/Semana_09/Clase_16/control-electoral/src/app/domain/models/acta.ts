export type Dignidad = 'alcalde' | 'prefecto';

export type EstadoActa = 'VALIDADA' | 'OBSERVADA' | 'CORREGIDA';

export interface VotoCandidatura {
  candidaturaId: string;
  votos: number;
}

export interface Acta {
  id: string;
  jrvId: string;
  dignidad: Dignidad;
  votos: VotoCandidatura[];
  nulos: number;
  blancos: number;
  totalSufragantes: number;
  fotoPath: string;
  lat: number | null;
  lng: number | null;
  precisionM: number | null;
  capturadoEn: string | null;
  ubicacionComprobable: boolean;
  estado: EstadoActa;
  observacion: string | null;
  version: number;
  actualizadoEn: string;
}
