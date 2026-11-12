import type { Timestamp } from 'firebase/firestore';

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

export interface Candidato extends CandidatoForm {
  id: string;
  /** Asignada con serverTimestamp(). */
  creadoEn: Timestamp | null;
  /** Asignada con serverTimestamp() en cada edición. */
  actualizadoEn?: Timestamp | null;
}
