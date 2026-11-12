import type { Timestamp } from 'firebase/firestore';

/** Datos que captura y valida el formulario; es lo que se envía a Firestore. */
export interface CandidatoForm {
  nombres: string;
  correo: string;
  telefono: string;
  /** Formato YYYY-MM-DD. */
  fechaNacimiento: string;
  cargo: string;
  nivelAcademico: string;
  experienciaAnios: number;
  modalidad: string;
  habilidades: string[];
  /** Formato YYYY-MM-DD. */
  fechaDisponibilidad: string;
  aspiracionSalarial: number;
  resumen: string;
  consentimiento: boolean;
}

/** Documento de la colección `candidatos` tal como se lee desde Firestore. */
export interface Candidato extends CandidatoForm {
  id: string;
  /** Marca de creación asignada con serverTimestamp(). */
  creadoEn: Timestamp | null;
  /** Marca de la última edición asignada con serverTimestamp(). */
  actualizadoEn?: Timestamp | null;
}
