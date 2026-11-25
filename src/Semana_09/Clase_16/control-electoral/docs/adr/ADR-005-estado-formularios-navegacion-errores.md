# ADR-005: Manejar el estado con signals y errores tipados, los formularios con Reactive Forms tipados y la navegación con guardas por rol

| Campo | Valor |
|---|---|
| **Estado** | Aceptado |
| **Fecha** | 2026-11-24 |
| **Autor(es) y equipo** | Equipo 6: Eduardo Ganchala, Josué Ortiz |
| **Origen** | Propuesta de Josué Ortiz (su ADR-005), adaptada a Supabase. Integra las propuestas de Eduardo Ganchala sobre estado y navegación (su ADR-006) y sobre formularios (su ADR-007), que coinciden. |
| **Requisitos relacionados** | R9 (estrategia de estado; estados de carga, éxito, error y validación), R6 (consistencia de totales y correcciones), R2 (cédula validada), R3 (cambio obligatorio en el primer acceso), R4–R6 (navegación por rol). |

## Contexto

- **Formularios:** el crítico es el del acta (5 organizaciones, nulos, blancos y total de sufragantes con una regla cruzada); también
  los de cuentas con cédula ecuatoriana.
- **Navegación:** cada rol ve pantallas distintas, y quien no cambió la contraseña inicial no puede ir a otro sitio.
- **Estados visibles:** R9 exige mostrar carga, éxito, error y validación.
- **Datos:** llegan del backend por repositorios (ADR-004) como promesas; no se usa tiempo real.

## Alternativas consideradas

| Criterio | **A. Signals en servicios *store* por funcionalidad** | B. NgRx (Store/Effects o SignalStore) | C. Solo RxJS (`BehaviorSubject`) |
|---|---|---|---|
| Dependencias | Ninguna (incluido en Angular). | Paquetes NgRx. | Ninguna. |
| Ceremonia | Baja. | Alta. | Media (suscripciones). |
| Encaje con plantillas | `estado()` y `computed` (totales del acta, avance). | Selectores. | `async` pipe. |
| Adecuación al tamaño | Adecuada: 4 funcionalidades. | Excesiva para el plazo. | Válida, con riesgo de fugas. |

**Formularios:** Reactive Forms tipados (validadores de grupo, pruebas sin DOM) frente a Template-driven forms (validación cruzada
incómoda y difícil de probar).

## Decisión

### Estado

- Un servicio *store* por funcionalidad (`VeedorMesasStore`, `RecintoStore`, `ProvincialDashboardStore`) expone **signals de solo
  lectura** (`asReadonly()`) y métodos de intención (`asignarVeedor()`, `guardarActa()`); los derivados usan `computed`.
- **Modelo de estado con errores tipados**, igual en todas las pantallas:
  ```ts
  type Estado<T> =
    | { tipo: 'inactivo' }
    | { tipo: 'cargando' }
    | { tipo: 'exito'; datos: T }
    | { tipo: 'vacio' }
    | { tipo: 'error'; error: ErrorApp; reintentar?: () => void };

  type ErrorApp = { codigo: 'sin-conexion' | 'sin-permiso' | 'credenciales' | 'validacion' | 'conflicto' | 'desconocido'; mensaje: string };
  ```
- `<app-estado-vista>` dibuja el *skeleton*, el vacío, el error con «Reintentar» o el contenido. Al guardar: botón con indicador,
  toast verde de éxito y toast rojo con el mensaje traducido.

### Formularios y validación

- **Reactive Forms tipados** (`FormGroup<...>`, `nonNullable`). Validadores puros en `domain/rules`, envueltos como `ValidatorFn`.
- **`cedulaEcuatoriana`:** 10 dígitos; provincia `01`–`24` o `30`; tercer dígito `< 6`; verificador por módulo 10 con coeficientes
  `2,1,2,1,2,1,2,1,2`.
- **Contacto:** celular `^09\d{8}$` y correo válido.
- **Votos:** enteros `≥ 0`.
- **`consistenciaActa`** (validador de grupo): `Σ votos(5 organizaciones) + nulos + blancos = totalSufragantes`, con la diferencia en
  vivo («Faltan 3 votos» / «Sobran 2 votos»).
- **Acta físicamente inconsistente:** el veedor puede marcar «El acta física presenta inconsistencia» con una **observación
  obligatoria** (≥ 10 caracteres); el acta queda `OBSERVADA`. Sin esa marca no se guarda si no cuadra.
- **Correcciones (R6):** el formulario se precarga; al guardar, el acta pasa a `CORREGIDA`, sube su `version` y la anterior queda en
  `acta_historial` (ADR-008).
- La misma regla se valida en el servidor (RPC `guardar_acta` y trigger, ADR-008): el cliente es UX; el servidor, seguridad.

### Navegación

- Rutas con `loadComponent`: `/auth/login`, `/auth/cambiar-clave`, `/auth/recuperar`, `/provincial/...`, `/recinto/...`, `/veedor/...`.
- **Guardas funcionales (`CanActivateFn`):** `authGuard` (sin sesión → login), `cambioClaveGuard` (`perfiles.debe_cambiar_clave`
  verdadero → cambiar clave) y `rolGuard([...])` (rol de `perfiles` distinto → inicio de su rol).
- Tras el login se navega al inicio del rol; cada rol tiene su `ion-tabs`.
- **Las guardas son UX; el control real está en RLS** (ADR-008).

### Errores

- `GlobalErrorHandler` para lo no capturado (registro en consola + toast genérico).
- `supabase-error.mapper.ts` traduce los errores de Supabase a `ErrorApp` en español (`invalid_credentials` → «Cédula o contraseña
  incorrecta»; violación de RLS `42501` → «No tiene permiso para esta acción»; fallo de red → «Sin conexión»).

## Consecuencias

- **Beneficios:** sin dependencias extra; los estados de R9 son uniformes; las validaciones son funciones puras probadas.
- **Obligaciones:** toda pantalla de datos usa `Estado<T>` y `<app-estado-vista>`; todo formulario muestra errores por campo.
- **Limitaciones:** sin herramientas de depuración tipo NgRx DevTools.
- **Riesgo:** la regla de consistencia vive en TypeScript y en SQL y puede desincronizarse. **Mitigación:** los mismos casos de prueba
  en `acta-consistency.spec.ts` y en la prueba del trigger (ADR-010).

## Verificación

- `cedula.spec.ts`: válidas e inválidas (provincia 25, tercer dígito 6, verificador incorrecto, 9 dígitos).
- `acta-consistency.spec.ts`: suma exacta válida; sobran o faltan votos inválida; `OBSERVADA` sin observación inválida.
- Manual: con la contraseña inicial, ir a `/veedor/mesas` devuelve a `/auth/cambiar-clave`; un veedor que escribe
  `/provincial/dashboard` vuelve a su inicio.

## Uso de IA

- **Josué Ortiz · Claude (Anthropic):** estrategia de estado y validación para Ionic Angular y algoritmo de la cédula. Se aceptó; los
  errores traducidos pasan a ser los de Supabase.
- **Eduardo Ganchala · Gemini:** Signals en servicios con `Estado<T>` y guardas funcionales; formularios reactivos con validadores
  propios. Se integró.
- **Verificación humana:** pruebas unitarias de la cédula con casos válidos e inválidos, sin publicar cédulas reales.

## Trazabilidad

- Propuestas: `docs/adr-propuestas/ADR-005-estado-formularios-navegacion-errores.md` (aceptada) · propuesta de Eduardo Ganchala `ADR-006-estado-navegacion.md` y
  propuesta de Eduardo Ganchala `ADR-007-formularios-validacion-negocio.md` (integradas).
- Commit del ADR: [b0a29cb](https://github.com/NW08/Apps_GR1/commit/b0a29cb) · minutos del video: [caeff15](https://github.com/NW08/Apps_GR1/commit/caeff15)
- Commit de implementación: [a560c2e](https://github.com/NW08/Apps_GR1/commit/a560c2e)

## Consenso del equipo

| Integrante | Postura y argumentos | Objeciones |
|---|---|---|
| Josué Ortiz | Signals en *stores*, Reactive Forms tipados, guardas por rol y estado explícito con errores tipados. | Ninguna |
| Eduardo Ganchala | Signals en servicios con `Estado<T>`, guardas `authGuard`/`rolGuard`/`cambioClaveGuard` y formularios reactivos. | Ninguna |

**Acuerdo final:** signals con errores tipados y guardas, por acuerdo de ambos. · **Minuto del video:** 00:38:30–00:47:02 (consenso 00:46:05–00:46:27)
