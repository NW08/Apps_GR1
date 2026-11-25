# ADR-005: Manejar el estado con signals, los formularios con Reactive Forms tipados, la navegación con guardas por rol y los errores con un modelo de estado explícito

| Campo | Valor |
|---|---|
| **Estado** | Aceptado |
| **Fecha** | 2026-11-23 |
| **Autor(es) y equipo** | Josué Ortiz · Equipo 6: Eduardo Ganchala, Josué Ortiz |
| **Requisitos relacionados** | R9 (estrategia de estado justificada; estados de carga, éxito, error y validación), R6 (validar la consistencia de totales y permitir correcciones), R2 (cédula ecuatoriana validada), R3 (cambio obligatorio en el primer acceso), R4–R6 (navegación distinta por rol). |

## Contexto

- **Origen de los datos:** llegan de Firestore como flujos en tiempo real (mesas, actas); la UI debe reflejarlos sin recargar.
- **Formularios:** el más crítico es el del acta, que lleva 5 organizaciones, nulos, blancos y total de sufragantes con una regla cruzada;
  también hay formularios de cuentas con validación de cédula.
- **Navegación:** cada rol ve un menú y unas pantallas distintas, y quien no cambió su contraseña inicial no puede ir a ningún otro sitio.
- **Estados visibles:** R9 exige mostrar explícitamente carga, éxito, error y validación.

## Alternativas consideradas

**Estado**

| Criterio | **A. Signals de Angular en servicios «store» por funcionalidad (+ `toSignal` para los flujos de Firestore)** | B. NgRx (Store/Effects o SignalStore) | C. Solo RxJS (`BehaviorSubject` en servicios) |
|---|---|---|---|
| Dependencias | Ninguna (incluido en Angular). | Paquetes NgRx. | Ninguna. |
| Ceremonia | Baja. | Alta (acciones, reducers, efectos), o media con SignalStore. | Media (`subscribe`/`unsubscribe`, `async` pipe). |
| Encaje con plantillas | Lectura directa `estado()`, `computed` para derivados (totales del acta, avance). | Selectores. | `async` pipe. |
| Justificación para el tamaño de la app | Adecuada: 4 funcionalidades, sin estado global complejo. | Excesiva para 4 días. | Válida, pero más propensa a fugas de suscripciones. |

**Formularios:** Reactive Forms tipados (**elegido**: validadores de grupo y pruebas sin DOM) frente a Template-driven forms (validaciones
cruzadas incómodas y difíciles de probar).

## Decisión

### Estado

- Un servicio *store* por funcionalidad (`VeedorMesasStore`, `RecintoStore`, `ProvincialDashboardStore`) expone **signals de solo
  lectura** y métodos de intención (`asignarVeedor()`, `guardarActa()`).
- Los flujos de Firestore entran por los repositorios como `Observable` y se convierten con `toSignal`; los derivados se calculan con `computed`.
- **Modelo de estado explícito**, reutilizado en todas las pantallas:
  ```ts
  type Estado<T> =
    | { tipo: 'inactivo' }
    | { tipo: 'cargando' }
    | { tipo: 'exito'; datos: T }
    | { tipo: 'vacio' }
    | { tipo: 'error'; mensaje: string; reintentar?: () => void };
  ```
  Un componente compartido `<app-estado-vista>` dibuja el *skeleton* (cargando), el mensaje de vacío, el error con «Reintentar» o el
  contenido.
- **Acciones de guardado:** `ion-loading`/botón deshabilitado mientras se guarda, `ion-toast` verde al terminar con éxito y toast rojo
  con el mensaje traducido si falla.

### Formularios y validación

- **Reactive Forms tipados** (`FormGroup<...>`, `nonNullable`).
- **Validadores** en `domain/rules` (funciones puras), envueltos como `ValidatorFn` en `shared/validators`:
  - **`cedulaEcuatoriana`**: 10 dígitos; provincia `01`–`24` o `30`; tercer dígito `< 6`; dígito verificador por módulo 10 con los
    coeficientes `2,1,2,1,2,1,2,1,2` (si un producto es > 9 se le resta 9; verificador = `(10 − suma % 10) % 10`).
  - **Contacto:** teléfono ecuatoriano (`^09\d{8}$` para celular) y correo (`Validators.email` + dominio con punto).
  - **Votos:** enteros `≥ 0` (`Validators.min(0)`, patrón `^\d+$`), con un máximo razonable de 999 por campo.
  - **`consistenciaActa`** (validador de grupo): `Σ votos(5 organizaciones) + nulos + blancos = totalSufragantes`. El formulario
    muestra en vivo la suma y la diferencia («Faltan 3 votos» / «Sobran 2 votos»).
  - **Acta físicamente inconsistente:** en la vida real un acta impresa puede no cuadrar. El veedor puede marcar «El acta física
    presenta inconsistencia» y escribir una **observación obligatoria** (≥ 10 caracteres). El acta queda en estado `OBSERVADA` para
    que la revise el coordinador; sin esa marca, no se puede guardar si no cuadra.
- **Mensajes de validación** bajo cada campo, mostrados tras `touched` o al intentar enviar; el botón «Guardar» no se deshabilita en
  silencio, sino que al pulsarlo señala los campos con error.
- **La misma regla de consistencia se repite en las reglas de Firestore** (ADR-008): la validación del cliente es para la UX; la del
  servidor, para la seguridad.
- **Correcciones (R6):** el veedor reabre su acta, el formulario se precarga y al guardar el estado pasa a `CORREGIDA`. La versión
  anterior se guarda en la subcolección `historial` (ADR-008).

### Navegación

- Rutas perezosas por funcionalidad: `/login`, `/cambiar-clave`, `/recuperar`, `/provincial/...`, `/recinto/...`, `/veedor/...`.
- **Guardas funcionales (`CanActivateFn`):**
  - `authGuard`: sin sesión → `/login`.
  - `cambioClaveGuard`: claim `debeCambiarClave` en `true` → `/cambiar-clave` (bloquea todo lo demás).
  - `rolGuard(['PROVINCIAL'])` etc.: si el rol del token no coincide → se redirige al inicio de su propio rol.
- Tras el login, el inicio se decide por el rol (`ROL → ruta inicial`). Cada rol tiene su propia barra de pestañas (`ion-tabs`).
- **Las guardas son solo UX; el control real está en las reglas del backend** (sección 10 del enunciado).

### Errores

- `GlobalErrorHandler` (implementa `ErrorHandler`) para lo no capturado: registra el error en la consola y muestra un toast genérico.
- `firebase-error.mapper.ts`: traduce los códigos de Firebase a mensajes en español (`auth/invalid-credential` → «Cédula o contraseña
  incorrecta»; `permission-denied` → «No tiene permiso para esta acción»; `unavailable` → «Sin conexión: se guardará al recuperarla»).

## Consecuencias

- **Beneficios:**
  - Sin dependencias extra.
  - Los cuatro estados de R9 son visibles y uniformes en todas las pantallas.
  - Las validaciones son funciones puras probadas y duplicadas en el servidor.
- **Obligaciones:** toda pantalla de datos usa `Estado<T>` y `<app-estado-vista>`; todo formulario muestra los errores por campo.
- **Limitaciones:** sin las herramientas de depuración de NgRx (*DevTools*); suficiente para este alcance.
- **Riesgo:** mantener la regla de consistencia en dos sitios (TypeScript y las reglas de Firestore) puede desincronizarlas.
  **Mitigación:** pruebas con los **mismos casos** en `acta-consistency.spec.ts` y en las pruebas de reglas (ADR-010).

## Verificación

- `cedula.spec.ts`: cédulas válidas e inválidas (provincia 25, tercer dígito 6, verificador incorrecto, 9 dígitos).
- `acta-consistency.spec.ts`: suma exacta → válida; sobran o faltan votos → inválida; `OBSERVADA` sin observación → inválida.
- **Manual:**
  - un usuario con la contraseña inicial intenta navegar a `/veedor/mesas` → la app lo devuelve a `/cambiar-clave`;
  - un veedor escribe `/provincial/dashboard` en la URL → la app lo redirige a su inicio.
- **Capturas** de los estados de carga, vacío, error y éxito en `docs/evidencias/`.

## Uso de IA

- **Herramienta:** Claude (Anthropic).
- **Consulta:** estrategia de estado y validación para Ionic Angular con Firestore; algoritmo de la cédula ecuatoriana.
- **Respuesta sugerida:** signals + Reactive Forms + guardas funcionales; módulo 10 para la cédula.
- **Aceptación / rechazo:** se aceptaron los signals en servicios *store*, los Reactive Forms tipados,
  las guardas funcionales por rol y el modelo de estado explícito con errores tipados. Los errores que se traducen al español pasan
  a ser los de Supabase (ADR-002), no los de Firestore.
- **Verificación humana:** se verificará el algoritmo de la cédula (módulo 10) con pruebas unitarias de
  cédulas válidas e inválidas, sin publicar cédulas reales, y que cada pantalla de datos muestre los estados de carga, vacío, error y
  éxito.

## Trazabilidad

- Commit del ADR: [enlace]
- Commit de implementación: [enlace]

## Consenso del equipo

| Integrante | Postura y argumentos | Objeciones |
|---|---|---|
| Josué Ortiz | Signals en servicios *store* por funcionalidad, Reactive Forms tipados con validadores de grupo, guardas funcionales por rol y un modelo de estado explícito (carga, éxito, error, validación) con errores tipados. | Ninguna |
| Eduardo Ganchala | Signals en servicios (fachadas) con un tipo `Estado<T>` (inactivo, cargando, éxito, error) y guardas funcionales (`authGuard`, `rolGuard`, `cambioClaveGuard`); formularios reactivos con validadores propios (sus propuestas ADR-006 y ADR-007). | Ninguna |

**Acuerdo final:** signals con errores tipados y guardas funcionales por rol; ambos integrantes de acuerdo. Las propuestas de
Eduardo sobre estado y navegación (su ADR-006) y sobre formularios (su ADR-007) coinciden con esta decisión y quedan integradas en
ella. ·
**Minuto del video:** 00:38:30–00:47:02 (consenso 00:46:05–00:46:27)
