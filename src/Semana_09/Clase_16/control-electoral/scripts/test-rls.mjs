// Prueba RLS contra Supabase real con la publishable key. Requiere .env.test (no versionado):
// VEEDOR_A_CEDULA, VEEDOR_A_CLAVE, RECINTO_CEDULA, RECINTO_CLAVE.
import { readFileSync, existsSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const env = Object.fromEntries(
  (existsSync('.env.test') ? readFileSync('.env.test', 'utf8') : '')
    .split(/\r?\n/)
    .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]),
);
const fuente = readFileSync('src/environments/environment.ts', 'utf8');
const URL = /supabaseUrl:\s*'([^']+)'/.exec(fuente)?.[1];
const KEY = /supabaseAnonKey:\s*'([^']+)'/.exec(fuente)?.[1];

let fallos = 0;
function verificar(descripcion, condicion) {
  console.log(`[${condicion ? 'OK' : 'FALLA'}] ${descripcion}`);
  if (!condicion) fallos++;
}

async function sesion(cedula, clave) {
  const sb = createClient(URL, KEY, { auth: { persistSession: false } });
  const { data: email } = await sb.rpc('email_por_cedula', { p_cedula: cedula });
  const { error } = await sb.auth.signInWithPassword({ email, password: clave });
  if (error) throw new Error(`No se pudo iniciar sesión con ${cedula}: ${error.message}`);
  return sb;
}

const recinto = await sesion(env.RECINTO_CEDULA, env.RECINTO_CLAVE);
const veedorA = await sesion(env.VEEDOR_A_CEDULA, env.VEEDOR_A_CLAVE);
const { data: yo } = await veedorA.auth.getUser();

const { data: mesasRecinto } = await recinto.from('jrv').select('id, numero, veedor_id');
const ajena = (mesasRecinto ?? []).find((m) => m.veedor_id && m.veedor_id !== yo.user.id) ??
  (mesasRecinto ?? []).find((m) => m.veedor_id !== yo.user.id);
verificar('existe una mesa que no pertenece al veedor A', !!ajena);

const { data: visibles } = await veedorA.from('jrv').select('id, veedor_id');
verificar('el veedor A solo ve mesas asignadas a él', (visibles ?? []).every((m) => m.veedor_id === yo.user.id));

const { data: leida } = await veedorA.from('jrv').select('id').eq('id', ajena.id);
verificar(`el veedor A NO puede leer la JRV #${ajena.numero} ajena (0 filas)`, (leida ?? []).length === 0);

const { data: actasAjenas } = await veedorA.from('actas').select('id').eq('jrv_id', ajena.id);
verificar('el veedor A NO puede leer actas de la mesa ajena', (actasAjenas ?? []).length === 0);

const { data: reasignada } = await veedorA.from('jrv').update({ veedor_id: yo.user.id }).eq('id', ajena.id).select('id');
verificar('el veedor A NO puede asignarse la mesa ajena', (reasignada ?? []).length === 0);

const { error: errGuardar } = await veedorA.rpc('guardar_acta', {
  p_jrv_id: ajena.id, p_dignidad: 'alcalde', p_votos: [], p_nulos: 0, p_blancos: 0, p_total_sufragantes: 0,
  p_foto_path: 'x', p_lat: null, p_lng: null, p_precision_m: null, p_capturado_en: null,
  p_ubicacion_comprobable: false, p_es_inconsistente: false, p_observacion: null, p_client_uuid: null,
});
verificar('el veedor A NO puede registrar un acta en la mesa ajena', !!errGuardar);

const { data: consolidado } = await veedorA.from('avance_actas_recinto').select('recinto_id');
verificar('el veedor A NO obtiene el avance de otros recintos', (consolidado ?? []).length <= 1);

const { error: errFn } = await veedorA.functions.invoke('crear-coordinador-recinto', { body: {} });
verificar('el veedor A NO puede crear coordinadores (403)', !!errFn);

console.log(fallos === 0 ? '\nRLS OK: todas las verificaciones pasaron.' : `\n${fallos} verificación(es) fallaron.`);
process.exit(fallos === 0 ? 0 : 1);
