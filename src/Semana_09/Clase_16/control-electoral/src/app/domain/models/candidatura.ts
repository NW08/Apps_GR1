import type { Dignidad } from './acta';

export interface Organizacion {
  id: string;
  nombre: string;
  lista: string;
}

export interface Candidatura {
  id: string;
  organizacionId: string;
  organizacionNombre: string;
  lista: string;
  dignidad: Dignidad;
  nombre: string;
}
