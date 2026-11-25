import type { Rol } from './rol';

export interface Perfil {
  id: string;
  cedula: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  email: string;
  rol: Rol;
  recintoId: string | null;
  debeCambiarClave: boolean;
}

export interface NuevaCuenta {
  cedula: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  email: string;
}
