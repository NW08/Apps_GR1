# ADR-007: Crear las cuentas con Edge Functions de Supabase, iniciar sesión con la cédula mediante una RPC y guardar el rol en `perfiles`

| Campo | Valor |
|---|---|
| **Estado** | Aceptado |
| **Fecha** | 2026-11-24 |
| **Autor(es) y equipo** | Equipo 6: Eduardo Ganchala, Josué Ortiz |
| **Origen** | Propuesta de Eduardo Ganchala (identidad y roles de su ADR-002). Rechaza la propuesta de Josué Ortiz (su ADR-007, Cloud Functions + *custom claims*), que quedó fuera de alcance al elegir Supabase. |
| **Requisitos relacionados** | R2 (sin autorregistro; provincial → coordinador de recinto → veedor; cédula validada; confirmación de cuenta), R3 (login con cédula, contraseña inicial `Ecuador2026`, cambio obligatorio, recuperación por correo, sin claves administrativas en la app), R8 (rol y pertenencia en el servidor). |

## Contexto

No hay autorregistro: cada cuenta la crea un usuario de rol superior, lo que exige privilegios administrativos que no pueden estar en
la app. El identificador visible es la cédula, pero Supabase Auth autentica por correo. El cambio de contraseña inicial debe ser
obligatorio aun si alguien llama a la API directamente.

## Alternativas consideradas

**Identidad**

| Criterio | **A. Correo real en Auth + RPC `email_por_cedula`** | B. Correo sintético `cedula@dominio` |
|---|---|---|
| Recuperación por correo (R3) | Funciona con el correo real. | **Se rompe**: el correo sintético no existe. |
| Login | Una llamada extra a la RPC antes de `signInWithPassword`. | Directo. |
| Riesgo | La RPC permite comprobar si una cédula existe. | Ninguno adicional. |

**Creación de cuentas y rol**

| Criterio | **A. Edge Functions + rol en `perfiles`** | B. Cloud Functions + *custom claims* (Firebase) | C. Crear cuentas desde el cliente |
|---|---|---|---|
| Claves administrativas | `service_role` solo como secreto del servidor. | Admin SDK en el servidor. | Expone privilegios o requiere trucos inseguros. |
| Costo | Plan Free. | Plan Blaze. | — |
| Aplicable | Sí. | **No: el equipo usa Supabase (ADR-002).** | No cumple R3. |

## Decisión

- **Identidad:** el usuario de Supabase Auth se crea con el **correo real**. La cédula es un campo único de `perfiles`. En el login, la
  app llama a la RPC `email_por_cedula(cedula)` (`security definer`, ejecutable por `anon`, devuelve solo el correo) y luego a
  `signInWithPassword`.
- **Creación de cuentas:** solo mediante las Edge Functions `crear-coordinador-recinto` (llamada por el provincial) y `crear-veedor`
  (llamada por el coordinador de recinto). Cada una verifica el rol de quien llama a partir del JWT, valida la cédula y los datos,
  crea el usuario con la contraseña inicial `Ecuador2026` usando la `service_role` y **envía el correo de confirmación** de la cuenta.
- **Cambio obligatorio:** `perfiles.debe_cambiar_clave = true` al crear la cuenta. Las políticas RLS exigen que sea `false` para leer
  o escribir datos de negocio, y `cambioClaveGuard` redirige en la app. Al cambiarla (`auth.updateUser` + RPC
  `marcar_clave_cambiada`), la nueva clave no puede ser `Ecuador2026`.
- **Recuperación:** `auth.resetPasswordForEmail` con el correo real.
- **Roles:** columna `perfiles.rol` (`provincial`, `recinto`, `veedor`) y `perfiles.recinto_id`; funciones SQL `auth_rol()` y
  `auth_recinto_id()` usadas por las políticas (ADR-008).
- **Correos:** SMTP propio configurado en Supabase (proveedor con plan gratuito), porque el SMTP por defecto tiene un límite muy bajo.
- **Cuenta inicial:** la cuenta del coordinador provincial de demostración se crea una vez desde el panel de Supabase y se vincula a su
  perfil con la siembra.

## Consecuencias

- **Beneficios:** ninguna clave administrativa en el cliente; el cambio obligatorio no se puede saltar desde la API.
- **Obligaciones:** los secretos (`service_role`, SMTP) solo como secretos de las Edge Functions; desplegar las funciones con la CLI de
  Supabase o desde el panel.
- **Riesgos:** la RPC `email_por_cedula` permite enumerar cédulas registradas; se limita a devolver solo el correo y se acepta como
  riesgo documentado. El SMTP gratuito puede retrasar o filtrar correos como spam.

## Verificación

- Un veedor que llama a `crear-coordinador-recinto` recibe 403.
- Con la contraseña inicial sin cambiar, una consulta directa a `actas` con su JWT devuelve 0 filas.
- `git grep -i "service_role" -- src android` sin resultados.
- Crear un veedor envía el correo de confirmación; «¿Olvidaste tu contraseña?» envía el de recuperación.

## Uso de IA

- **Eduardo Ganchala · Gemini:** autenticación por cédula y autorización por rol en Supabase. Se aceptó.
- **Josué Ortiz · Claude (Anthropic):** Functions + *claims* + correo sintético. Se rechazó por depender de Firebase; el correo
  sintético también se descarta porque rompe la recuperación.
- **Verificación humana:** pruebas de los cuatro puntos de la sección anterior con las cuentas de demostración.

## Trazabilidad

- Propuestas: `adr-edu/ADR-002-supabase-auth-roles.md` (aceptada) · `adr-mio/ADR-007-identidad-cuentas-roles.md` (rechazada).
- Commit del ADR: [enlace]
- Commit de implementación: [enlace: Edge Functions, `auth.service.ts`, guardas]

## Consenso del equipo

| Integrante | Postura y argumentos | Objeciones |
|---|---|---|
| Eduardo Ganchala | Supabase Auth con Edge Functions, roles en `perfiles` y login por cédula con la RPC `email_por_cedula`. | — |
| Josué Ortiz | Cloud Functions con *custom claims* y login con cédula. | — |

**Acuerdo final:** Josué presentó su propuesta dentro del bloque del backend; al acordarse Supabase (ADR-002) quedó fuera de
alcance y se adoptó la de Eduardo sin debate adicional. · **Minuto del video:** 00:12:20–00:15:41, dentro del bloque del backend (consenso 00:16:23–00:17:58)
