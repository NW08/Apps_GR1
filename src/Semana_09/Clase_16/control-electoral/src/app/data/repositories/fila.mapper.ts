import type { Perfil } from '../../domain/models/perfil';

export function aPerfil(f: Record<string, any>): Perfil {
  return {
    id: f['id'],
    cedula: f['cedula'],
    nombres: f['nombres'],
    apellidos: f['apellidos'],
    telefono: f['telefono'],
    email: f['email'],
    rol: f['rol'],
    recintoId: f['recinto_id'] ?? null,
    debeCambiarClave: !!f['debe_cambiar_clave'],
  };
}
