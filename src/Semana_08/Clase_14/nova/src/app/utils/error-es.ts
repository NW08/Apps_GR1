const ERROR_TRANSLATIONS: [RegExp, string][] = [
  [/user already registered/i, 'Este correo ya está registrado.'],
  [/invalid login credentials/i, 'Correo o contraseña incorrectos.'],
  [/email not confirmed/i, 'Debes confirmar tu correo electrónico antes de ingresar.'],
  [/password should be at least (\d+) characters/i, 'La contraseña debe tener al menos 6 caracteres.'],
  [/new password should be different from the old password/i, 'La nueva contraseña debe ser diferente a la anterior.'],
  [/unable to validate email address/i, 'El formato del correo electrónico no es válido.'],
  [
    /rate limit|too many requests|only request this after/i,
    'Demasiados intentos. Espera unos segundos antes de volver a intentarlo.',
  ],
  [/auth session missing|jwt expired|invalid refresh token/i, 'Tu sesión expiró. Inicia sesión nuevamente.'],
  [/signup is disabled/i, 'El registro de nuevos usuarios está deshabilitado.'],
  [/row-level security policy/i, 'No tienes permisos para realizar esta acción.'],
  [/duplicate key value/i, 'Ya existe un registro con ese valor (por ejemplo, ese nombre de usuario).'],
  [
    /failed to fetch|networkerror|network request failed/i,
    'Error de conexión. Verifica tu internet e intenta de nuevo.',
  ],
  [/user denied geolocation|location permission denied/i, 'Permiso de ubicación denegado.'],
  [/permission denied/i, 'Permiso denegado en el servidor (revisa las políticas SQL en Supabase).'],
  [/timeout expired/i, 'Se agotó el tiempo de espera para obtener la ubicación.'],
  [/exceeded the maximum allowed size|payload too large/i, 'El archivo supera el tamaño máximo permitido.'],
];

/**
 * Traduce mensajes de error técnicos o en inglés (Supabase, red, geolocalización) al español.
 */
export function traducirError(err: unknown, fallback = 'Ocurrió un error inesperado'): string {
  const raw =
    err instanceof Error
      ? err.message
      : typeof err === 'object' && err !== null && 'message' in err
        ? String((err as { message: unknown }).message)
        : '';

  if (!raw) return fallback;

  for (const [pattern, translation] of ERROR_TRANSLATIONS) {
    if (pattern.test(raw)) {
      return translation;
    }
  }

  // Si ya contiene caracteres o palabras propias del español, conservarlo tal cual.
  if (/[áéíóúñ¿¡]/i.test(raw)) {
    return raw;
  }

  return fallback;
}
