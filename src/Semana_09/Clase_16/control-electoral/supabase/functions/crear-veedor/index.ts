import { json, responderOptions } from '../_shared/cors.ts';
import { crearCuenta, ErrorHttp, perfilDelLlamante, responderError, validarDatos } from '../_shared/crear-cuenta.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return responderOptions();
  if (req.method !== 'POST') return json({ ok: false, error: 'Método no permitido' }, 405);

  try {
    const llamante = await perfilDelLlamante(req, 'recinto');
    if (!llamante.recinto_id) throw new ErrorHttp(403, 'El coordinador no tiene recinto asignado');

    const datos = validarDatos(await req.json().catch(() => ({})));
    const resultado = await crearCuenta(datos, 'veedor', llamante.recinto_id, llamante.id);
    return json({ ok: true, ...resultado }, 201);
  } catch (e) {
    return responderError(e);
  }
});
