import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2';
import { esCedulaValida } from './cedula.ts';
import { json } from './cors.ts';

export const CLAVE_INICIAL = 'Ecuador2026';

type Rol = 'provincial' | 'recinto' | 'veedor';

export interface DatosCuenta {
  cedula: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  email: string;
}

export interface PerfilLlamante {
  id: string;
  rol: Rol;
  recinto_id: string | null;
}

export class ErrorHttp extends Error {
  constructor(
    public readonly status: number,
    mensaje: string,
  ) {
    super(mensaje);
  }
}

const URL = Deno.env.get('SUPABASE_URL')!;
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

export function clienteAdmin(): SupabaseClient {
  return createClient(URL, SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function perfilDelLlamante(req: Request, rolPermitido: Rol): Promise<PerfilLlamante> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) throw new ErrorHttp(401, 'Sesión requerida');

  const cliente = createClient(URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });
  const { data: usuario, error } = await cliente.auth.getUser(authHeader.replace('Bearer ', ''));
  if (error || !usuario?.user) throw new ErrorHttp(401, 'Sesión inválida o expirada');

  // Se lee con el cliente administrador para no depender de las políticas de perfiles.
  const { data: perfil } = await clienteAdmin()
    .from('perfiles')
    .select('id, rol, recinto_id, debe_cambiar_clave')
    .eq('id', usuario.user.id)
    .maybeSingle();

  if (!perfil) throw new ErrorHttp(403, 'El usuario no tiene perfil');
  if (perfil.debe_cambiar_clave) throw new ErrorHttp(403, 'Debe cambiar su contraseña inicial');
  if (perfil.rol !== rolPermitido) throw new ErrorHttp(403, 'Su rol no puede crear esta cuenta');

  return { id: perfil.id, rol: perfil.rol, recinto_id: perfil.recinto_id };
}

export function validarDatos(cuerpo: Record<string, unknown>): DatosCuenta {
  const texto = (v: unknown) => (typeof v === 'string' ? v.trim() : '');
  const datos: DatosCuenta = {
    cedula: texto(cuerpo['cedula']),
    nombres: texto(cuerpo['nombres']),
    apellidos: texto(cuerpo['apellidos']),
    telefono: texto(cuerpo['telefono']),
    email: texto(cuerpo['email']).toLowerCase(),
  };

  if (!esCedulaValida(datos.cedula)) throw new ErrorHttp(400, 'Cédula ecuatoriana inválida');
  if (datos.nombres.length < 2) throw new ErrorHttp(400, 'Nombres obligatorios');
  if (datos.apellidos.length < 2) throw new ErrorHttp(400, 'Apellidos obligatorios');
  if (!/^09\d{8}$/.test(datos.telefono)) throw new ErrorHttp(400, 'Teléfono celular inválido (09XXXXXXXX)');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.email)) throw new ErrorHttp(400, 'Correo inválido');

  return datos;
}

export async function crearCuenta(
  datos: DatosCuenta,
  rol: Rol,
  recintoId: string,
  creadoPor: string,
): Promise<{ id: string; correoEnviado: boolean }> {
  const admin = clienteAdmin();

  // Cédula duplicada → 409 antes de tocar Auth.
  const { data: existente } = await admin.from('perfiles').select('id').eq('cedula', datos.cedula).maybeSingle();
  if (existente) throw new ErrorHttp(409, 'Ya existe una cuenta con esa cédula');

  const { data: creado, error: errorAuth } = await admin.auth.admin.createUser({
    email: datos.email,
    password: CLAVE_INICIAL,
    email_confirm: false,
  });
  if (errorAuth || !creado?.user) {
    const duplicado = /already|registered|exists/i.test(errorAuth?.message ?? '');
    throw new ErrorHttp(duplicado ? 409 : 500, duplicado ? 'Ya existe una cuenta con ese correo' : 'No se pudo crear el usuario');
  }

  const { error: errorPerfil } = await admin.from('perfiles').insert({
    id: creado.user.id,
    cedula: datos.cedula,
    nombres: datos.nombres,
    apellidos: datos.apellidos,
    telefono: datos.telefono,
    email: datos.email,
    rol,
    recinto_id: recintoId,
    creado_por: creadoPor,
    debe_cambiar_clave: true,
  });
  if (errorPerfil) {
    // Rollback: no dejar usuarios de Auth sin perfil.
    await admin.auth.admin.deleteUser(creado.user.id);
    throw new ErrorHttp(errorPerfil.code === '23505' ? 409 : 500, 'No se pudo crear el perfil');
  }

  // Confirmación de cuenta (R2). Si el correo falla, la cuenta queda creada igual.
  const anon = createClient(URL, ANON_KEY, { auth: { persistSession: false } });
  const { error: errorCorreo } = await anon.auth.resend({ type: 'signup', email: datos.email });

  return { id: creado.user.id, correoEnviado: !errorCorreo };
}

export function responderError(e: unknown): Response {
  if (e instanceof ErrorHttp) return json({ ok: false, error: e.message }, e.status);
  console.error('Error inesperado', e);
  return json({ ok: false, error: 'Error interno' }, 500);
}
