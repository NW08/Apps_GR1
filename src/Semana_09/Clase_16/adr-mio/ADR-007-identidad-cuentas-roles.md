# ADR-007: Gestionar las cuentas con Cloud Functions y custom claims, usando la cédula como identificador de inicio de sesión y enviando los correos desde el backend

| Campo                       | Valor                                                                                                                                                                                                                                                                                                                                                             |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Estado** | Rechazado: depende de Cloud Functions y *custom claims* de Firebase, fuera del alcance al usar Supabase (ADR-002). El equipo adoptó la propuesta de Eduardo Ganchala (Supabase Auth, Edge Functions y RPC `email_por_cedula`) como decisión final ADR-007 |
| **Fecha**                   | 2026-11-23                                                                                                                                                                                                                                                                                                                                                        |
| **Autor(es) y equipo**      | Josué Ortiz · Equipo 6: Eduardo Ganchala, Josué Ortiz                                                                                                                                                                                                                                                                                                                    |
| **Requisitos relacionados** | R2 (sin autorregistro; jerarquía provincial → recinto → veedor; cédula validada, nombres, apellidos, teléfono y correo; confirmación de cuenta), R3 (cédula como identificador visible, contraseña inicial `Ecuador2026`, cambio obligatorio, recuperación por correo, sin claves administrativas en la app), R8 (rol y pertenencia verificables por las reglas). |

## Contexto

- **Creación jerárquica:** un usuario crea la cuenta de otro (provincial → coordinador de recinto → veedor). El SDK cliente de Firebase
  solo permite crear la cuenta **propia**; crear la de otro sin cerrar la sesión exige el **Admin SDK**, y su credencial **no puede
  estar en la app** (R3).
- **Inicio de sesión:** Firebase Auth inicia sesión con correo y contraseña, pero R3 pide la **cédula** como identificador visible.
- **Confirmación y recuperación:** deben llegar al **correo real** de la persona.
- **Contraseña inicial:** es la misma para todos (`Ecuador2026`), así que el cambio en el primer acceso debe ser **imposible de saltar**,
  no solo una pantalla.
- **Autorización:** las reglas de Firestore y Storage necesitan conocer el **rol** y el **recinto** del usuario sin consultas extra.

## Alternativas consideradas

| Criterio                              | **A. Cloud Functions (Admin SDK) + custom claims + correo sintético por cédula**      | B. Segunda instancia de Auth en el cliente + rol en un documento de Firestore                                    | C. Correo real en Auth + función que traduce la cédula en correo                             |
| ------------------------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Claves administrativas en la app      | No (solo en Functions).                                                               | No, pero la cuenta la crea el cliente: cualquiera con la configuración web podría crear cuentas (luego sin rol). | No.                                                                                          |
| Rol inalterable por el usuario        | Sí: los claims solo los escribe el Admin SDK.                                         | Depende de las reglas que protejan `usuarios/{uid}.rol`.                                                         | Sí (con claims).                                                                             |
| Inicio de sesión con cédula           | Directo: `<cedula>@<dominio sintético>` + contraseña, sin consulta previa.            | Requiere un índice público cédula → correo (**filtra correos**).                                                 | Requiere una función que, dada la cédula, devuelva el correo (**permite enumerar correos**). |
| Correos (confirmación y recuperación) | Los envía la función por SMTP al correo real, con enlaces generados por el Admin SDK. | Nativos de Firebase.                                                                                             | Nativos de Firebase.                                                                         |
| Cambio de contraseña obligatorio      | Claim `debeCambiarClave`, comprobado **en las reglas**.                               | Campo en Firestore (comprobable en las reglas, con un `get()` extra).                                            | Claim.                                                                                       |
| Coste                                 | Plan Blaze (cuota gratuita suficiente).                                               | Gratuito (plan Spark).                                                                                           | Blaze.                                                                                       |

## Decisión

Se elige **A**.

### Identificador de inicio de sesión

- La cuenta de Firebase Auth usa el correo sintético `<cedula>@usuarios.control-electoral.invalid`. El dominio reservado `.invalid`
  nunca recibe correo; el valor exacto se fija en `environment` y debe comprobarse con el emulador que Auth lo acepta.
- La pantalla de login pide **cédula** y contraseña; `AuthService` construye el correo sintético y llama a `signInWithEmailAndPassword`.
- El **correo real** se guarda en `usuarios/{uid}.correo` y en el perfil, y solo se usa para enviar mensajes.
- **Persistencia de la sesión en Capacitor:** `initializeAuth(app, { persistence: indexedDBLocalPersistence })` (no `getAuth`), que
  es la recomendación para WebViews nativas.

### Funciones *callable* (`functions/src/accounts.ts`, región cercana, TypeScript)

| Función | Quién puede llamarla (claims del llamante) | Qué hace |
|---|---|---|
| `crearCoordinadorRecinto` | `rol == 'PROVINCIAL'` | Valida los datos (la misma regla de cédula que el cliente, con pruebas propias). Reserva la cédula con `cedulas/{cedula}` en una transacción (unicidad). Crea el usuario en Auth con la contraseña `Ecuador2026`, fija los claims `{rol:'RECINTO', recintoId, debeCambiarClave:true}`, escribe `usuarios/{uid}`, asigna `recintos/{id}.coordinadorUid` (rechaza si el recinto ya tiene coordinador, salvo con `reemplazar:true`) y envía el correo de bienvenida. |
| `crearVeedor` | `rol == 'RECINTO'` | Igual, con los claims `{rol:'VEEDOR', recintoId: <el del llamante>, debeCambiarClave:true}`. Un coordinador no puede crear veedores de otro recinto. |
| `cambiarClaveInicial` | Cualquier usuario autenticado con `debeCambiarClave` | Aplica la política (≥ 8 caracteres, letras y números, distinta de `Ecuador2026`). Ejecuta `updateUser(uid, { password })` y pone el claim `debeCambiarClave:false`. El cliente vuelve a iniciar sesión con la clave nueva. |
| `solicitarRecuperacion` | Pública (sin sesión) | Recibe la cédula. Si existe, genera `generatePasswordResetLink(correoSintetico)` y lo envía al correo real. **Siempre responde lo mismo** («Si la cédula está registrada, enviamos un enlace al correo asociado»), exista o no, para no permitir enumerar cédulas. |

### Correos

- Los envía la función con `nodemailer` y una cuenta SMTP (p. ej. Gmail con contraseña de aplicación). La contraseña SMTP es un
  **secreto de Functions** (`defineSecret('SMTP_PASS')`), nunca en el repositorio.
- **Bienvenida (confirmación de cuenta, R2):** datos de la cuenta, aviso de la contraseña inicial y del cambio obligatorio, y un enlace
  de verificación (`generateEmailVerificationLink`). Abrir el enlace marca `emailVerified`, lo que confirma que el correo real es
  de esa persona.

### Primera cuenta provincial

La crea el script de siembra (ADR-008) con el Admin SDK en local; sus credenciales de demostración van en el README.

### Cambio de contraseña obligatorio

Se aplica en **tres niveles**:

1. **Guarda de ruta** (`cambioClaveGuard`, ADR-005).
2. **Reglas de Firestore y Storage:** toda lectura y escritura de datos exige `request.auth.token.debeCambiarClave == false` (ADR-008).
3. **La función** es la única que puede poner el claim en `false`.

## Consecuencias

- **Beneficios:**
  - Ninguna clave administrativa en la app.
  - El rol y el recinto viajan en el token y las reglas los leen sin coste.
  - El login con cédula no expone correos.
  - El cambio de clave no se puede saltar ni manipulando la app.
- **Obligaciones:**
  - Plan Blaze (ADR-002).
  - Secreto SMTP configurado por cada integrante.
  - Tras cambiar los claims, el cliente fuerza `getIdToken(true)`.
- **Limitaciones:**
  - Los correos dependen del SMTP (límite diario de Gmail, más que suficiente).
  - Sin conexión no se crean cuentas.
- **Riesgos:**
  - **Contraseña inicial conocida por todos:** hasta que el usuario la cambia, cualquiera que conozca su cédula podría entrar.
    **Mitigación:**
    - el claim bloquea todos los datos hasta el cambio, así que un intruso solo podría cambiar la clave, y el dueño lo notaría al no
      poder entrar y lo recuperaría por correo;
    - se recomienda que el coordinador pida a cada persona cambiarla en el momento de crear la cuenta.

    Se documenta como riesgo aceptado, porque R3 impone la clave común.
  - Si un integrante no puede activar Blaze → ADR de reemplazo con la alternativa B.

## Verificación

- **Pruebas de Functions con el emulador** (`functions/test/accounts.spec.ts`):
  - un veedor llama a `crearVeedor` → `permission-denied`;
  - un coordinador del recinto R1 no puede crear un veedor en R2 (el recinto sale del token, no del cuerpo);
  - una cédula duplicada → `already-exists`;
  - una cédula inválida → `invalid-argument`;
  - `cambiarClaveInicial` con `Ecuador2026` → rechazo.
- **Prueba de reglas:** un usuario con `debeCambiarClave:true` no puede leer `mesas` (ADR-008).
- **Manual:**
  - crear un veedor → llega el correo de bienvenida al correo real;
  - el primer login lleva a «Cambiar contraseña»;
  - «¿Olvidó su contraseña?» con la cédula → llega el enlace y la nueva clave funciona.
- `git grep -i "service_account\|private_key\|SMTP_PASS="` → sin resultados.

## Uso de IA

- **Herramienta:** Claude (Anthropic).
- **Consulta:** cómo cumplir R2 y R3 con Firebase sin exponer claves y con la cédula como identificador.
- **Respuesta sugerida:** Functions + claims + correo sintético + SMTP para los correos.
- **Aceptación / rechazo:** se rechazó. La propuesta (Functions + *claims* + correo sintético) depende
  de Firebase, que el equipo descartó en ADR-002.
- **Verificación humana:** no aplica a esta propuesta; la verificación (un veedor no puede crear cuentas;
  ninguna clave `service_role` en la app) se hace sobre la decisión final.

## Trazabilidad

- Commit del ADR: [enlace]
- Commit de implementación: no aplica (propuesta rechazada); la implementación sigue la decisión final ADR-007 (Supabase).

## Consenso del equipo

| Integrante | Postura y argumentos | Objeciones |
|---|---|---|
| Josué Ortiz | Cloud Functions (`crearCoordinadorRecinto`, `crearVeedor`) con *custom claims* de rol y recinto, y login con la cédula como identificador visible. | — |
| Eduardo Ganchala | Supabase Auth con Edge Functions para crear cuentas sin exponer la `service_role` key, roles en la tabla `perfiles` y login por cédula mediante la RPC `email_por_cedula` (su ADR-002). | — |

**Acuerdo final:** Josué presentó su propuesta dentro del bloque del backend; al acordarse Supabase (ADR-002) quedó fuera de
alcance y se adoptó la de Eduardo sin debate adicional. ·
**Minuto del video:** 00:12:20–00:15:41, dentro del bloque del backend (consenso 00:16:23–00:17:58)
