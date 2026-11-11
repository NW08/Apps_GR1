export interface Candidato {
  id?: string;
  nombres: string;
  correo: string;
  telefono: string;
  fechaNacimiento: string;
  cargo: string;
  nivelAcademico: string;
  experienciaAnios: number;
  modalidad: string;
  habilidades: string[];
  fechaDisponibilidad: string;
  aspiracionSalarial: number;
  resumen: string;
  consentimiento: boolean;
  creadoEn?: any;
}

