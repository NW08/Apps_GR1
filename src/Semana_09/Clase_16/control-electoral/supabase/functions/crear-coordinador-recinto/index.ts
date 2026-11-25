import { json, responderOptions } from '../_shared/cors.ts';
import {
  clienteAdmin,
  crearCuenta,
  ErrorHttp,
  perfilDelLlamante,
  responderError,
  validarDatos,
} from '../_shared/crear-cuenta.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return responderOptions();
  if (req.method !== 'POST') return json({ ok: false, error: 'Método no permitido' }, 405);

  try {
    const llamante = await perfilDelLlamante(req, 'provincial');
    const cuerpo = await req.json().catch(() => ({}));
    const datos = validarDatos(cuerpo);

    const recintoId = typeof cuerpo['recinto_id'] === 'string' ? cuerpo['recinto_id'] : '';
    if (!recintoId) throw new ErrorHttp(400, 'Recinto obligatorio');

    const admin = clienteAdmin();
    const { data: recinto } = await admin.from('recintos').select('id').eq('id', recintoId).maybeSingle();
    if (!recinto) throw new ErrorHttp(400, 'El recinto no existe');

    // Un solo coordinador por recinto (R4).
    const { data: coordinador } = await admin
      .from('perfiles')
      .select('id')
      .eq('rol', 'recinto')
      .eq('recinto_id', recintoId)
      .maybeSingle();
    if (coordinador) throw new ErrorHttp(409, 'El recinto ya tiene un coordinador');

    const resultado = await crearCuenta(datos, 'recinto', recintoId, llamante.id);
    return json({ ok: true, ...resultado }, 201);
  } catch (e) {
    return responderError(e);
  }
});
