import type { ErrorApp } from '../../domain/models/estado';

export function mapearError(e: unknown): ErrorApp {
  const err = (e ?? {}) as { message?: string; code?: string; status?: number; name?: string };
  const msg = (err.message ?? String(e ?? '')).toString();

  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return { codigo: 'sin-conexion', mensaje: 'Sin conexión a internet. Intente de nuevo al recuperar la señal.' };
  }
  if (/failed to fetch|network|fetch failed|load failed/i.test(msg)) {
    return { codigo: 'sin-conexion', mensaje: 'No se pudo contactar al servidor. Revise su conexión.' };
  }
  if (err.code === 'invalid_credentials' || /invalid login credentials/i.test(msg)) {
    return { codigo: 'credenciales', mensaje: 'Cédula o contraseña incorrecta.' };
  }
  if (err.code === '42501' || err.status === 403 || /permission denied|row-level security|no autorizado/i.test(msg)) {
    return { codigo: 'sin-permiso', mensaje: 'No tiene permiso para esta acción.' };
  }
  if (/DEBE_CAMBIAR_CLAVE/.test(msg)) {
    return { codigo: 'sin-permiso', mensaje: 'Debe cambiar su contraseña inicial antes de continuar.' };
  }
  if (/TOTALES_INCONSISTENTES/.test(msg)) {
    return { codigo: 'validacion', mensaje: 'Los totales del acta no cuadran. Corríjalos o márquela como observada.' };
  }
  if (/CONFLICTO_VERSION/.test(msg)) {
    return { codigo: 'conflicto', mensaje: 'El acta fue modificada por otra persona. Recargue antes de guardar.' };
  }
  if (err.code === '23505' || err.status === 409 || /duplicate|already|ya existe|registrad/i.test(msg)) {
    return { codigo: 'validacion', mensaje: msg && !/duplicate key/i.test(msg) ? msg : 'El registro ya existe.' };
  }
  if (err.status === 400 || err.code === '23514') {
    return { codigo: 'validacion', mensaje: msg || 'Datos no válidos.' };
  }
  return { codigo: 'desconocido', mensaje: 'Ocurrió un error inesperado. Intente nuevamente.' };
}
