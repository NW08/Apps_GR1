# Prueba 2 · Control electoral — ADR definitivos del Equipo 6

**Integrantes:** Eduardo Ganchala · Josué Ortiz
**Fecha de la deliberación:** 2026-11-24 · **Video:** https://youtu.be/Yn3_Y0NRamQ · **Acta:** [ACTA-CONSENSO.md](ACTA-CONSENSO.md)

Documento consolidado de la línea base arquitectónica común. Cada ADR indica de qué propuesta individual proviene, las alternativas,
el riesgo aceptado, cómo se verifica y el acuerdo alcanzado. Las propuestas de Josué Ortiz se conservan en `../adr-propuestas/`; las de Eduardo Ganchala, en su repositorio. Cualquier sustitución posterior se registra con un nuevo ADR.

## Índice y trazabilidad de propuestas

| ADR final | Decisión | Propuesta de Josué Ortiz | Propuesta de Eduardo Ganchala | Requisitos |
|---|---|---|---|---|
| [ADR-001](#adr-001) | Ionic Angular standalone + Capacitor | ADR-001 · Aceptada | ADR-001 · Aceptada | R1–R9 |
| [ADR-002](#adr-002) | Supabase como backend | ADR-002 (Firebase) · Rechazada | ADR-002 · **Aceptada** | R2, R3, R4, R8, R10 |
| [ADR-003](#adr-003) | Solo cámara, nitidez por Laplaciano, GPS opcional con etiqueta | ADR-003 · **Aceptada con modificaciones** | ADR-005 · Sustituida | R5, R6, R7, R10 |
| [ADR-004](#adr-004) | Capas + carpetas por funcionalidad + repositorios | ADR-004 · **Aceptada** | ADR-004 · Sustituida | R4–R6, R8, R9, R10 |
| [ADR-005](#adr-005) | Signals con errores tipados, Reactive Forms y guardas | ADR-005 · **Aceptada** | ADR-006 y ADR-007 · Integradas | R2, R3, R4–R6, R9 |
| [ADR-006](#adr-006) | Offline con Dexie + Filesystem (opcional) | ADR-006 (caché de Firestore) · Rechazada | ADR-009 · **Aceptada** | R6, R7, R8, R10 |
| [ADR-007](#adr-007) | Cuentas con Edge Functions y login por cédula | ADR-007 (Functions + claims) · Rechazada | ADR-002 · **Aceptada** | R2, R3, R8 |
| [ADR-008](#adr-008) | Modelo relacional, RLS, Storage privado, vistas e índices | ADR-008 (Firestore) · Rechazada | ADR-003 · **Aceptada** | R1, R4–R8 |
| [ADR-009](#adr-009) | Dashboard con vistas SQL, barras CSS y OpenStreetMap | ADR-009 (Chart.js) · Rechazada | ADR-010 · **Aceptada con modificaciones** | R4, R8, R9 |
| [ADR-010](#adr-010) | Pruebas en tres niveles, errores y monitoreo | ADR-010 · **Aceptada** | ADR-008 · Sustituida | R2, R3, R6–R9 |

## Trazabilidad requisito → ADR

| Requisito | ADR |
|---|---|
| R1 · Datos iniciales | 008 |
| R2 · Jerarquía y cuentas | 007, 005, 002 |
| R3 · Acceso | 007, 005, 002 |
| R4 · Coordinador provincial | 009, 008, 007 |
| R5 · Coordinador de recinto | 008, 005, 003 |
| R6 · Veedor | 005, 008, 003 |
| R7 · Cámara y ubicación | 003, 008 |
| R8 · Backend y seguridad | 002, 007, 008, 010 |
| R9 · Arquitectura y UX | 004, 005, 001 |
| R10 · Conectividad (extra) | 006, 002 |

---

<a id="adr-001"></a>

## ADR-001: Usar Ionic Angular (componentes standalone) con Capacitor como framework de la aplicación

| Campo | Valor |
|---|---|
| **Estado** | Aceptado |
| **Fecha** | 2026-11-24 |
| **Autor(es) y equipo** | Equipo 6: Eduardo Ganchala, Josué Ortiz |
| **Origen** | Propuesta común: ADR-001 de Josué Ortiz y ADR-001 de Eduardo Ganchala (ambas eligen Angular standalone) |
| **Requisitos relacionados** | R9 (separación de capas, estado, UX), R7 (Capacitor para cámara y GPS), R1–R8 (todo el desarrollo depende de esta elección). Sección 10 del enunciado: solo se admiten Ionic Angular standalone o Ionic React. |

### Contexto

Cada integrante entrega su propia aplicación, pero con la misma línea base tecnológica, y hay que elegir uno de los dos frameworks
permitidos. Criterios:

- **Plazo:** del 21 al 25 de noviembre para desarrollar, probar y generar el APK.
- **Arquitectura:** se evalúa la separación entre presentación, lógica de negocio y acceso a datos (R9).
- **Formularios:** muchos y con validaciones cruzadas (actas con totales, cédula, cuentas).
- **Defensa:** cada integrante debe explicar y modificar su código en vivo.

### Alternativas consideradas

| Criterio | **A. Ionic Angular standalone** | B. Ionic React |
|---|---|---|
| Experiencia del equipo | Ambos la conocen; es el framework de todos los proyectos del curso. | Ambos tienen experiencia, pero no se ha usado en el curso. |
| Separación de capas | Inyección de dependencias nativa: los repositorios se inyectan en los servicios y estos en las páginas. | Hooks y contextos; depende de la disciplina de cada integrante, con más riesgo de divergencia. |
| Formularios y validación | Reactive Forms tipados con validadores de grupo («suma de votos = total»). | Requiere librerías extra (React Hook Form + Zod). |
| Estado | Signals incluidos en el framework. | `useState`/`useReducer` o librerías (Zustand, Redux Toolkit). |
| Navegación y guardas | Router con `CanActivateFn` por rol y carga diferida con `loadComponent`. | React Router + `IonReactRouter`; guardas hechas a mano. |
| Curva y peso | Más conceptos (DI, decoradores) y un bundle algo mayor. | Más ligera de arrancar. |
| Integración con Capacitor | Idéntica en ambos. | Idéntica. |

### Decisión

Se elige **Ionic Angular con componentes standalone** (sin NgModules), TypeScript en modo `strict` y **Capacitor** para Android.

**Línea base de versiones** (estables vigentes al 2026-11-25; el equipo no fijó números en la reunión y se adoptan estas):

| Elemento | Versión |
|---|---|
| Node.js | 26.x (Angular CLI 22 admite `^22.22.3`, `^24.15.0` o `>=26.0.0`) |
| Angular / Angular CLI | 22.3.x (TypeScript `>=6.0 <6.1`, exigido por `@angular/compiler-cli`) |
| Ionic Angular | 9.0.x |
| Capacitor (`core`, `cli`, `android`) | 8.6.x |
| Plugins | `@capacitor/camera` 8.2.x · `@capacitor/geolocation` 8.2.x · `@capacitor/filesystem` 8.1.x · `@capacitor/network` 8.0.x |
| Cliente de backend | `@supabase/supabase-js` 2.x (ADR-002) |
| Android | Capacitor 8 compila con **JDK 21** (`sourceCompatibility`/`targetCompatibility` 21), AGP 8.13, `compileSdk`/`targetSdk` 36, `minSdk` 24 |

- Proyecto creado con `ionic start` (Angular, standalone); `main.ts` con `bootstrapApplication`, `provideIonicAngular()` y
  `provideRouter(routes)`.
- Solo plataforma Android (`npx cap add android`).
- La compilación por terminal usa JDK 21 (Temurin); en Android Studio se usa su JBR integrado. El proyecto no fija
  `org.gradle.java.home` para no atar el IDE a una ruta local.

### Consecuencias

- **Beneficios:** la DI permite que las páginas no conozcan el backend (ADR-004); los formularios reactivos cubren R2, R3 y R6 sin
  librerías; las guardas soportan la navegación por rol (el control real está en el backend, ADR-008).
- **Obligaciones:** todo componente es standalone con sus `imports` explícitos de `@ionic/angular/standalone`; misma versión mayor
  de Angular, Ionic y Capacitor en los dos repositorios.
- **Limitaciones:** bundle mayor que en React; irrelevante para un APK.
- **Riesgo:** al importar los componentes de Ionic uno a uno, olvidar un import o un icono (`addIcons`) produce elementos que no se
  renderizan. **Mitigación:** probar cada pantalla con `ionic serve` y revisar la consola antes de compilar para Android.

### Verificación

- `ionic info` muestra las versiones de la tabla en ambos equipos.
- `grep -R "NgModule" src/` sin resultados; `tsconfig.json` con `"strict": true`.
- `ionic build && npx cap sync android` termina sin errores y Gradle genera el APK.

### Uso de IA

- **Josué Ortiz · Claude (Anthropic):** comparación A/B para Angular standalone, Ionic, Capacitor y Android Studio. Se aceptó sin
  cambios de fondo.
- **Eduardo Ganchala · Gemini:** comparación de Angular y React para el enunciado; recomendó Angular por formularios reactivos y DI.
  Se aceptó.
- **Verificación humana:** ambos contrastaron la comparación con su experiencia en el curso; las versiones se verificaron en el
  registro de npm y en el `build.gradle` de `@capacitor/android` 8.6 (Java 21).

### Trazabilidad

- Propuestas: `docs/adr-propuestas/ADR-001-ionic-angular-standalone.md` · propuesta de Eduardo Ganchala `ADR-001-ionic-angular-standalone.md`.
- Commit del ADR: [b0a29cb](https://github.com/NW08/Apps_GR1/commit/b0a29cb) · minutos del video: [caeff15](https://github.com/NW08/Apps_GR1/commit/caeff15)
- Commit de implementación: [9b229e5](https://github.com/NW08/Apps_GR1/commit/9b229e5)

### Consenso del equipo

| Integrante | Postura y argumentos | Objeciones |
|---|---|---|
| Josué Ortiz | Angular standalone: la DI oculta el backend tras repositorios y los Reactive Forms tipados resuelven la validación cruzada. | Ninguna |
| Eduardo Ganchala | Angular standalone: formularios reactivos, DI para separar capas y menor riesgo de divergencia entre implementaciones. | Ninguna |

**Acuerdo final:** Ionic Angular standalone con Capacitor, por unanimidad; se prioriza el framework de todo el curso. ·
**Minuto del video:** 00:00:43–00:05:06

---

<a id="adr-002"></a>

## ADR-002: Usar Supabase (PostgreSQL, Auth, Storage y Edge Functions) como backend

| Campo | Valor |
|---|---|
| **Estado** | Aceptado |
| **Fecha** | 2026-11-24 |
| **Autor(es) y equipo** | Equipo 6: Eduardo Ganchala, Josué Ortiz |
| **Origen** | Propuesta de Eduardo Ganchala (su ADR-002). Rechaza la propuesta de Josué Ortiz (su ADR-002, Firebase). |
| **Requisitos relacionados** | R8 (backend, reglas por rol y pertenencia, persistencia de datos e imágenes), R2 y R3 (cuentas creadas por terceros sin claves administrativas en la app, ver ADR-007), R4 (dashboard con agregaciones, ADR-009), R10 (offline, ADR-006). |

### Contexto

El enunciado admite Firebase, Supabase o Appwrite. El backend debe cubrir:

1. autenticación con contraseña inicial, cambio obligatorio y recuperación por correo;
2. creación de cuentas por otros usuarios sin privilegios administrativos en la app;
3. autorización **en el servidor** por rol y pertenencia, demostrable (un veedor no accede a mesas ajenas);
4. almacenamiento privado de las fotos de actas;
5. consultas agregadas para el dashboard.

Criterios: expresividad de las reglas de acceso, consultas relacionales, **costo (preferible gratuito)** y experiencia del equipo.

### Alternativas consideradas

| Criterio | **A. Supabase** | B. Firebase | C. Appwrite |
|---|---|---|---|
| Modelo de datos | Relacional (PostgreSQL): `GROUP BY` y vistas para el dashboard. | Documental: sin *joins*; agregaciones limitadas. | Documental, consultas limitadas. |
| Reglas de acceso | Row Level Security en SQL; «mesas asignadas a mí» se expresa con *joins*. | Security Rules con *custom claims*; la pertenencia exige `get()` o desnormalizar. | Permisos por documento; menos expresivos. |
| Crear usuarios por terceros | Edge Functions con la `service_role` como secreto del servidor, **gratis en el plan Free**. | Cloud Functions + Admin SDK: **exige el plan Blaze** (tarjeta y pago por uso). | Functions con API key de servidor. |
| Offline | Sin offline nativo: cola propia (ADR-006). | Caché persistente de Firestore. | Sin offline nativo. |
| Fotos | Storage con políticas sobre el mismo modelo. | Cloud Storage con reglas. | Buckets con permisos. |
| Experiencia del equipo | Ambos la han usado. | Ambos la han usado. | Josué no la ha usado. |
| Costo | Plan Free suficiente; el proyecto se pausa tras inactividad. | Blaze obligatorio para Functions. | Nube gratuita o autoalojado. |

### Decisión

Se elige **Supabase** en el plan **Free**, un proyecto por integrante (entregas individuales):

- **PostgreSQL** con el esquema, políticas RLS, vistas e índices de ADR-008, versionados en `supabase/migrations/` y `supabase/seed.sql`.
- **Auth** con correo y contraseña; la cédula es el identificador visible (ADR-007).
- **Storage** con un bucket privado `actas` y URLs firmadas de corta duración (ADR-008).
- **Edge Functions** solo para operaciones privilegiadas (crear coordinadores y veedores, ADR-007).
- La app usa únicamente la **anon key** (pública por diseño, protegida por RLS) en `environment.ts`, que no se versiona; se versiona
  `environment.example.ts`. La `service_role` existe solo como secreto de las Edge Functions.

### Consecuencias

- **Beneficios:** reglas de acceso verificables con SQL; agregaciones del dashboard en el servidor; sin costo.
- **Obligaciones:** mantener las migraciones versionadas; aplicarlas en el proyecto real antes de generar el APK.
- **Limitaciones:** sin offline nativo (R10 requiere una cola propia, ADR-006); límite bajo de correos con el SMTP por defecto.
- **Riesgos:**
  - Una política RLS mal escrita abre datos ajenos o bloquea a usuarios legítimos. **Mitigación:** pruebas de RLS por rol (ADR-010).
  - El plan Free pausa el proyecto por inactividad. **Mitigación:** reactivarlo y comprobarlo antes de la defensa.

### Verificación

- `supabase/migrations/` y `supabase/seed.sql` existen en el repositorio y se aplican sin errores.
- `git grep -i "service_role" -- src android` sin resultados.
- Prueba de RLS: el veedor A no obtiene la mesa ni el acta del veedor B (ADR-010).

### Uso de IA

- **Eduardo Ganchala · Gemini:** comparación de Supabase, Firebase y Appwrite; recomendó Supabase por PostgreSQL y RLS. Se aceptó.
- **Josué Ortiz · Claude (Anthropic):** la misma comparación recomendó Firebase con plan Blaze. **Se rechazó** en la deliberación
  por el costo del plan Blaze.
- **Verificación humana:** se confirmó que Cloud Functions exige Blaze y que las Edge Functions de Supabase funcionan en el plan Free.

### Trazabilidad

- Propuestas: propuesta de Eduardo Ganchala `ADR-002-supabase-auth-roles.md` (aceptada) · `docs/adr-propuestas/ADR-002-firebase-backend.md` (rechazada).
- Commit del ADR: [b0a29cb](https://github.com/NW08/Apps_GR1/commit/b0a29cb) · minutos del video: [caeff15](https://github.com/NW08/Apps_GR1/commit/caeff15)
- Commit de implementación: [d3a09fe](https://github.com/NW08/Apps_GR1/commit/d3a09fe)

### Consenso del equipo

| Integrante | Postura y argumentos | Objeciones |
|---|---|---|
| Eduardo Ganchala | Supabase: relacional, RLS por rol y pertenencia, Edge Functions gratuitas y agregaciones SQL para el dashboard. | Firebase exige el plan Blaze para Cloud Functions. |
| Josué Ortiz | Firebase: caché offline nativa, Security Rules con *claims* y correos nativos de Auth. | Supabase no tiene offline nativo. |

**Desacuerdo relevante:** el plan Blaze de Firebase.

**Acuerdo final:** Supabase. No se vio factible gastar dinero habiendo opciones gratuitas y comunitarias que cubren R2, R3 y R8; la
falta de offline nativo se asume con una cola propia (ADR-006). · **Minuto del video:** 00:05:21–00:18:06 (consenso 00:16:23–00:17:58)

---

<a id="adr-003"></a>

## ADR-003: Capturar la foto del acta solo con la cámara (Capacitor), comprobar su nitidez con la varianza del Laplaciano y guardar el GPS como campos del registro

| Campo | Valor |
|---|---|
| **Estado** | Aceptado |
| **Fecha** | 2026-11-24 |
| **Autor(es) y equipo** | Equipo 6: Eduardo Ganchala, Josué Ortiz |
| **Origen** | Propuesta de Josué Ortiz (su ADR-003), con modificaciones del debate. Sustituye a la propuesta de Eduardo Ganchala (su ADR-005, coincidente en lo técnico). |
| **Requisitos relacionados** | R7 (foto desde la app, nitidez antes de aceptar, GPS como campos, permisos y errores), R6 (el acta incluye foto y ubicación), R5 (el coordinador corrige fotos), R10 (fotos pendientes sin conexión). |

### Contexto

Cada acta (alcaldía y prefectura) necesita una foto que sirva como **evidencia auténtica**, una comprobación de nitidez antes de
aceptarla y las coordenadas GPS como campos del registro. Los permisos pueden negarse, el GPS puede fallar en interiores o en
recintos sin cobertura, y las fotos de 12 MP pesan 3–6 MB. Debe funcionar en un Android físico sin servicios de pago.

### Alternativas consideradas

**Origen de la foto**

| Criterio | **A. Solo cámara (`CameraSource.Camera`)** | B. Cámara o galería (`CameraSource.Prompt`) |
|---|---|---|
| Autenticidad | La foto se toma en el momento, desde la app. | Una foto de galería puede ser antigua, de otra mesa o editada. |
| Flexibilidad | Si la cámara falla, hay que repetir. | Permite reutilizar una foto tomada con otro teléfono. |

**Captura:** `@capacitor/camera` (oficial, control de calidad y tamaño, permisos explícitos) frente a `<input type="file" capture>`
(comportamiento distinto según el dispositivo) y a un escáner de documentos con ML Kit (dependencia extra de Google Play Services).

**Nitidez**

| Criterio | **A. Varianza del Laplaciano en canvas (TypeScript propio)** | B. OpenCV.js | C. Solo confirmación visual |
|---|---|---|---|
| Peso | ~60 líneas, sin dependencias. | ~8 MB de WASM. | 0. |
| Explicable en la defensa | Sí: convolución 3×3 sobre escala de grises. | Caja negra. | — |
| Cumple «comprobar nitidez» | Sí. | Sí. | **No**. |

**Ubicación sin GPS**

| Criterio | **A. Guardar con la etiqueta «Ubicación no comprobable»** | B. Bloquear el registro hasta obtener GPS |
|---|---|---|
| Recintos sin cobertura | El acta no se pierde. | El veedor no puede registrar. |
| Control | El coordinador ve qué actas no tienen ubicación verificable. | Ubicación siempre presente. |

### Decisión

- **Captura:** `Camera.getPhoto({ source: CameraSource.Camera, resultType: CameraResultType.Uri, quality: 70, width: 1600,
  correctOrientation: true, saveToGallery: false })`. **No se permite la galería.** La imagen (JPEG de ~300–600 KB) se sube como
  `Blob` al bucket privado (ADR-008) o, sin conexión, se guarda en `Filesystem` (ADR-006).
- **Nitidez** (`image-quality.util.ts`, función pura con pruebas):
  1. reducir la imagen a ~500 px de ancho en un `canvas` y pasarla a escala de grises;
  2. aplicar el kernel Laplaciano `[0,1,0; 1,-4,1; 0,1,0]` y calcular la varianza;
  3. rechazar si `varianza < UMBRAL_NITIDEZ_POR_DEFECTO` (**100**) o si el brillo medio es menor que `BRILLO_MINIMO_POR_DEFECTO`
     (**35**), con el mensaje «La foto está borrosa u oscura; vuelva a tomarla con buena luz y sin mover el teléfono»;
  4. la foto aceptada se muestra en vista previa con «Usar foto» / «Repetir».
- **GPS:** `Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 15000, maximumAge: 0 })` al aceptar la foto. Se
  guardan `lat`, `lng`, `precision_m` y `capturado_en` como columnas del acta. Si el GPS falla (permiso denegado, apagado o tiempo
  agotado), la app ofrece «Reintentar» y, si persiste, **permite guardar** con `ubicacion_comprobable = false` y la etiqueta
  visible **«Ubicación no comprobable»** para el coordinador y el dashboard.
- **Permisos:** `DevicePermissionsService` llama a `checkPermissions()` antes de cada uso; si es `prompt`, pide el permiso; si es
  `denied`, explica cómo activarlo en Ajustes. `AndroidManifest.xml` declara `CAMERA`, `ACCESS_FINE_LOCATION` y
  `ACCESS_COARSE_LOCATION`.
- **Errores con mensajes en español:** cancelación de la cámara (no es error), permiso denegado, GPS desactivado, tiempo agotado,
  foto borrosa u oscura y fallo de subida.

### Consecuencias

- **Beneficios:** evidencia auténtica; regla de nitidez explicable y probada; fotos ligeras para datos móviles y la cola offline; el
  acta no se pierde por falta de GPS.
- **Obligaciones:** calibrar el umbral y el brillo con fotos reales; probar en un dispositivo físico.
- **Limitaciones:** la varianza también baja con poca textura (hoja casi en blanco) y puede rechazar fotos válidas; se puede repetir
  sin límite y el coordinador de recinto puede corregir la foto (R5).
- **Riesgo:** un veedor podría desactivar el GPS a propósito para no registrar su ubicación. **Mitigación:** la etiqueta «Ubicación no
  comprobable» queda visible y filtrable en el dashboard y en la lista de GPS (ADR-009).

### Verificación

- `image-quality.util.spec.ts`: una imagen sintética nítida supera el umbral; la misma difuminada no; una imagen negra no supera el brillo.
- Manual en Android: negar el permiso de cámara → mensaje con instrucciones; foto movida → rechazo; GPS apagado → se guarda con
  «Ubicación no comprobable»; foto nítida con GPS → el acta guarda `lat`, `lng` y `precision_m`.
- El selector de la cámara no ofrece la galería.

### Uso de IA

- **Josué Ortiz · Claude (Anthropic):** cómo comprobar la nitidez sin librerías pesadas y gestionar permisos de Capacitor; sugirió la
  varianza del Laplaciano y `checkPermissions`/`requestPermissions`. Se aceptó; la regla de GPS obligatorio se cambió en el debate.
- **Eduardo Ganchala · Gemini:** recomendó evaluar la nitidez en el cliente y verificar permisos explícitamente. Se aceptó parcialmente.
- **Verificación humana:** calibración del umbral (100) y del brillo (35) con fotos reales en un dispositivo físico.

### Trazabilidad

- Propuestas: `docs/adr-propuestas/ADR-003-capacitor-camara-gps-nitidez.md` (aceptada con modificaciones) ·
  propuesta de Eduardo Ganchala `ADR-005-capacitor-camara-gps-permisos.md` (sustituida).
- Commit del ADR: [b0a29cb](https://github.com/NW08/Apps_GR1/commit/b0a29cb) · minutos del video: [caeff15](https://github.com/NW08/Apps_GR1/commit/caeff15)
- Commit de implementación: [06008cd](https://github.com/NW08/Apps_GR1/commit/06008cd)

### Consenso del equipo

| Integrante | Postura y argumentos | Objeciones |
|---|---|---|
| Josué Ortiz | Solo cámara, Laplaciano con umbral 100, permisos explícitos. En la reunión propuso guardar sin GPS con etiqueta (cambio respecto a su propuesta escrita). | A la galería: una foto de galería puede ser fraudulenta o estar modificada. |
| Eduardo Ganchala | Capacitor Camera y Geolocation con Laplaciano. Propuso permitir la galería. En la reunión también propuso guardar sin GPS con etiqueta (cambio respecto a su propuesta escrita). | Ninguna |

**Desacuerdo relevante:** permitir o no la galería.

**Acuerdo final:** solo cámara, sin galería, por los requisitos y la verificación de autenticidad; guardado sin GPS con la etiqueta
«Ubicación no comprobable», porque hay lugares sin conexión; umbral 100 y brillo mínimo 35. · **Minuto del video:** 00:18:17–00:28:09 (consenso 00:26:24–00:28:09)

---

<a id="adr-004"></a>

## ADR-004: Organizar la aplicación en capas (presentación, dominio y datos) con carpetas por funcionalidad y repositorios que encapsulan Supabase

| Campo | Valor |
|---|---|
| **Estado** | Aceptado |
| **Fecha** | 2026-11-24 |
| **Autor(es) y equipo** | Equipo 6: Eduardo Ganchala, Josué Ortiz |
| **Origen** | Propuesta de Josué Ortiz (su ADR-004), adaptada a Supabase. Sustituye a la propuesta de Eduardo Ganchala (su ADR-004, por tipo técnico). |
| **Requisitos relacionados** | R9 (separar presentación, lógica de negocio y acceso a datos), R4–R6 (tres áreas funcionales por rol), R8 (el acceso a datos pasa por un solo punto), R10 (la sincronización se inserta en la capa de datos). |

### Contexto

Tres roles con pantallas distintas comparten las mismas entidades (recinto, mesa, acta, usuario). En la defensa se pregunta cómo se
reparten las responsabilidades entre interfaz, lógica y persistencia, y hay que **ubicar y modificar código en vivo**. Las reglas de
negocio (consistencia de totales, cédula, estado de la mesa) deben probarse sin Supabase ni Ionic, y un cambio de backend o el modo
offline no deberían tocar las páginas.

### Alternativas consideradas

| Criterio | **A. Capas + carpetas por funcionalidad** | B. Capas + carpetas por tipo técnico (`pages/`, `services/`, `models/`) | C. Páginas que llaman directamente a Supabase |
|---|---|---|---|
| Separación de responsabilidades | Explícita: página → servicio → repositorio → Supabase. | Existe, pero cada funcionalidad queda repartida en varias carpetas. | Nula: lógica y datos en la UI. |
| Encontrar el código de un rol | Una carpeta por rol. | Buscar en varias carpetas. | Todo en un archivo. |
| Pruebas de la lógica | Funciones puras y repositorios simulados. | Igual que A. | Imposible sin red. |
| Esfuerzo inicial | Medio. | Bajo. | Mínimo. |
| Riesgo | Sobreingeniería si se abusa de las capas. | Crece desordenada. | Incumple R9. |

### Decisión

Tres capas dentro de una estructura **por funcionalidad**:

```
src/app/
├── core/          # singletons: supabase.client.ts, auth (AuthService, guards), errors (ErrorHandler, mapeo de errores), ui (toasts)
├── domain/        # TypeScript puro, sin Angular ni Supabase
│   ├── models/    # Recinto, Mesa, Acta, Perfil, Organizacion, Candidatura, enums de rol y estado
│   └── rules/     # cedula.ts, acta-consistency.ts (funciones puras + .spec.ts)
├── data/          # única capa que importa @supabase/supabase-js
│   ├── repositories/   # ActaRepository, MesaRepository, RecintoRepository, PerfilRepository, DashboardRepository
│   ├── storage/        # FotoActaRepository (bucket privado, URLs firmadas)
│   ├── functions/      # CuentasApi (Edge Functions de ADR-007)
│   └── offline/        # cola de pendientes (ADR-006, opcional)
├── device/        # CameraService, GeolocationService, DevicePermissionsService, image-quality.util.ts
├── shared/        # componentes reutilizables (<app-estado-vista>, tarjeta de mesa), validadores
└── features/
    ├── auth/        # login, cambio de contraseña, recuperación
    ├── provincial/  # recintos, coordinadores, avance, mapa GPS, dashboard
    ├── recinto/     # mesas, veedores, asignación, corrección de actas
    └── veedor/      # mis mesas, registro y corrección de actas
```

**Reglas de dependencia:**

1. `features/*` solo usa servicios y componentes de `shared/`; **nunca importa `@supabase/supabase-js`**.
2. Los servicios de cada funcionalidad (p. ej. `ActaFormService`, `VeedorMesasStore`) orquestan los casos de uso y usan los repositorios.
3. `data/*` es la única capa que habla con Supabase y traduce filas (`snake_case`) a modelos del dominio.
4. `domain/*` no importa Angular, Ionic ni Supabase.
5. Las rutas de cada funcionalidad se cargan con `loadComponent` y se protegen con guardas (ADR-005).

### Consecuencias

- **Beneficios:** respuesta directa a la pregunta de la defensa; cada rol se ubica en una carpeta; las reglas de negocio se prueban en
  milisegundos; el modo offline se añade en `data/` sin tocar páginas.
- **Obligaciones:** respetar las reglas de dependencia; diagrama de capas en el README.
- **Limitaciones:** más archivos que la alternativa C; solo se crean repositorios para entidades con persistencia.
- **Riesgo:** «fugas» de tipos del cliente de Supabase (`PostgrestError`, filas con `snake_case`) hacia las páginas.
  **Mitigación:** los repositorios devuelven modelos del dominio y errores ya traducidos (ADR-005).

### Verificación

- `git grep -n "@supabase/supabase-js" -- src/app/features src/app/domain` sin resultados.
- `domain/rules/*.spec.ts` se ejecutan sin TestBed ni red.
- En la defensa: recorrido de «guardar acta» `acta-form.page.ts` → `ActaFormService` → `ActaRepository` → RPC `guardar_acta` → RLS.

### Uso de IA

- **Josué Ortiz · Claude (Anthropic):** estructura de carpetas para Ionic Angular standalone con tres roles; sugirió capas +
  funcionalidades + repositorios. Se aceptó; el backend encapsulado cambió de Firebase a Supabase.
- **Eduardo Ganchala · Gemini:** separación en capas con repositorios organizados por tipo técnico. Sustituida por la organización por
  funcionalidad.
- **Verificación humana:** revisión del árbol de carpetas en ambos repositorios y del `git grep` de la sección anterior.

### Trazabilidad

- Propuestas: `docs/adr-propuestas/ADR-004-arquitectura-capas.md` (aceptada) · propuesta de Eduardo Ganchala `ADR-004-arquitectura-por-capas.md` (sustituida).
- Commit del ADR: [b0a29cb](https://github.com/NW08/Apps_GR1/commit/b0a29cb) · minutos del video: [caeff15](https://github.com/NW08/Apps_GR1/commit/caeff15)
- Commit de implementación: [a560c2e](https://github.com/NW08/Apps_GR1/commit/a560c2e)

### Consenso del equipo

| Integrante | Postura y argumentos | Objeciones |
|---|---|---|
| Josué Ortiz | Capas + carpetas por funcionalidad + repositorios: más fácil de defender, de identificar el código y de saber dónde modificar un cambio o un componente. | Ninguna |
| Eduardo Ganchala | Capas organizadas por tipo técnico, con repositorios que aíslan Supabase. | Ninguna |

**Acuerdo final:** arquitectura por capas organizada por funcionalidad y con repositorios. · **Minuto del video:** 00:28:10–00:38:29 (consenso 00:36:25–00:38:29)

---

<a id="adr-005"></a>

## ADR-005: Manejar el estado con signals y errores tipados, los formularios con Reactive Forms tipados y la navegación con guardas por rol

| Campo | Valor |
|---|---|
| **Estado** | Aceptado |
| **Fecha** | 2026-11-24 |
| **Autor(es) y equipo** | Equipo 6: Eduardo Ganchala, Josué Ortiz |
| **Origen** | Propuesta de Josué Ortiz (su ADR-005), adaptada a Supabase. Integra las propuestas de Eduardo Ganchala sobre estado y navegación (su ADR-006) y sobre formularios (su ADR-007), que coinciden. |
| **Requisitos relacionados** | R9 (estrategia de estado; estados de carga, éxito, error y validación), R6 (consistencia de totales y correcciones), R2 (cédula validada), R3 (cambio obligatorio en el primer acceso), R4–R6 (navegación por rol). |

### Contexto

- **Formularios:** el crítico es el del acta (5 organizaciones, nulos, blancos y total de sufragantes con una regla cruzada); también
  los de cuentas con cédula ecuatoriana.
- **Navegación:** cada rol ve pantallas distintas, y quien no cambió la contraseña inicial no puede ir a otro sitio.
- **Estados visibles:** R9 exige mostrar carga, éxito, error y validación.
- **Datos:** llegan del backend por repositorios (ADR-004) como promesas; no se usa tiempo real.

### Alternativas consideradas

| Criterio | **A. Signals en servicios *store* por funcionalidad** | B. NgRx (Store/Effects o SignalStore) | C. Solo RxJS (`BehaviorSubject`) |
|---|---|---|---|
| Dependencias | Ninguna (incluido en Angular). | Paquetes NgRx. | Ninguna. |
| Ceremonia | Baja. | Alta. | Media (suscripciones). |
| Encaje con plantillas | `estado()` y `computed` (totales del acta, avance). | Selectores. | `async` pipe. |
| Adecuación al tamaño | Adecuada: 4 funcionalidades. | Excesiva para el plazo. | Válida, con riesgo de fugas. |

**Formularios:** Reactive Forms tipados (validadores de grupo, pruebas sin DOM) frente a Template-driven forms (validación cruzada
incómoda y difícil de probar).

### Decisión

#### Estado

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

#### Formularios y validación

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

#### Navegación

- Rutas con `loadComponent`: `/auth/login`, `/auth/cambiar-clave`, `/auth/recuperar`, `/provincial/...`, `/recinto/...`, `/veedor/...`.
- **Guardas funcionales (`CanActivateFn`):** `authGuard` (sin sesión → login), `cambioClaveGuard` (`perfiles.debe_cambiar_clave`
  verdadero → cambiar clave) y `rolGuard([...])` (rol de `perfiles` distinto → inicio de su rol).
- Tras el login se navega al inicio del rol; cada rol tiene su `ion-tabs`.
- **Las guardas son UX; el control real está en RLS** (ADR-008).

#### Errores

- `GlobalErrorHandler` para lo no capturado (registro en consola + toast genérico).
- `supabase-error.mapper.ts` traduce los errores de Supabase a `ErrorApp` en español (`invalid_credentials` → «Cédula o contraseña
  incorrecta»; violación de RLS `42501` → «No tiene permiso para esta acción»; fallo de red → «Sin conexión»).

### Consecuencias

- **Beneficios:** sin dependencias extra; los estados de R9 son uniformes; las validaciones son funciones puras probadas.
- **Obligaciones:** toda pantalla de datos usa `Estado<T>` y `<app-estado-vista>`; todo formulario muestra errores por campo.
- **Limitaciones:** sin herramientas de depuración tipo NgRx DevTools.
- **Riesgo:** la regla de consistencia vive en TypeScript y en SQL y puede desincronizarse. **Mitigación:** los mismos casos de prueba
  en `acta-consistency.spec.ts` y en la prueba del trigger (ADR-010).

### Verificación

- `cedula.spec.ts`: válidas e inválidas (provincia 25, tercer dígito 6, verificador incorrecto, 9 dígitos).
- `acta-consistency.spec.ts`: suma exacta válida; sobran o faltan votos inválida; `OBSERVADA` sin observación inválida.
- Manual: con la contraseña inicial, ir a `/veedor/mesas` devuelve a `/auth/cambiar-clave`; un veedor que escribe
  `/provincial/dashboard` vuelve a su inicio.

### Uso de IA

- **Josué Ortiz · Claude (Anthropic):** estrategia de estado y validación para Ionic Angular y algoritmo de la cédula. Se aceptó; los
  errores traducidos pasan a ser los de Supabase.
- **Eduardo Ganchala · Gemini:** Signals en servicios con `Estado<T>` y guardas funcionales; formularios reactivos con validadores
  propios. Se integró.
- **Verificación humana:** pruebas unitarias de la cédula con casos válidos e inválidos, sin publicar cédulas reales.

### Trazabilidad

- Propuestas: `docs/adr-propuestas/ADR-005-estado-formularios-navegacion-errores.md` (aceptada) · propuesta de Eduardo Ganchala `ADR-006-estado-navegacion.md` y
  propuesta de Eduardo Ganchala `ADR-007-formularios-validacion-negocio.md` (integradas).
- Commit del ADR: [b0a29cb](https://github.com/NW08/Apps_GR1/commit/b0a29cb) · minutos del video: [caeff15](https://github.com/NW08/Apps_GR1/commit/caeff15)
- Commit de implementación: [a560c2e](https://github.com/NW08/Apps_GR1/commit/a560c2e)

### Consenso del equipo

| Integrante | Postura y argumentos | Objeciones |
|---|---|---|
| Josué Ortiz | Signals en *stores*, Reactive Forms tipados, guardas por rol y estado explícito con errores tipados. | Ninguna |
| Eduardo Ganchala | Signals en servicios con `Estado<T>`, guardas `authGuard`/`rolGuard`/`cambioClaveGuard` y formularios reactivos. | Ninguna |

**Acuerdo final:** signals con errores tipados y guardas, por acuerdo de ambos. · **Minuto del video:** 00:38:30–00:47:02 (consenso 00:46:05–00:46:27)

---

<a id="adr-006"></a>

## ADR-006 (opcional, R10): Persistir los pendientes en IndexedDB con Dexie, las fotos con Filesystem y resolver conflictos por versión

| Campo | Valor |
|---|---|
| **Estado** | Aceptado (componente opcional: cada integrante lo implementa si el tiempo lo permite) |
| **Fecha** | 2026-11-24 |
| **Autor(es) y equipo** | Equipo 6: Eduardo Ganchala, Josué Ortiz |
| **Origen** | Propuesta de Eduardo Ganchala (su ADR-009). Rechaza la propuesta de Josué Ortiz (su ADR-006, caché de Firestore). |
| **Requisitos relacionados** | R10 (persistencia local y sincronización automática con estrategia de conflictos), R6/R7 (el acta y su foto deben llegar aunque el recinto no tenga cobertura), R8 (RLS se aplica igual al sincronizar). |

### Contexto

Los recintos pueden tener cobertura débil. El veedor debe poder capturar el acta, la foto y el GPS sin conexión y enviarlos después,
sin duplicados. Un coordinador puede corregir la misma acta mientras el veedor está sin conexión, lo que genera conflictos. Supabase
no tiene offline nativo (ADR-002) y la bonificación no debe comprometer el flujo en línea.

### Alternativas consideradas

| Criterio | **A. IndexedDB con Dexie + `@capacitor/filesystem`** | B. SQLite (`@capacitor-community/sqlite`) | C. `@capacitor/preferences` | D. Caché persistente de Firestore |
|---|---|---|---|---|
| Ajuste | Cola con índices; funciona en Android y en el navegador. | Robusto y relacional. | Clave-valor trivial. | Cola de escrituras automática. |
| Costo | Una dependencia ligera; fotos aparte. | Plugin nativo, configuración extra, no funciona en navegador sin más. | No sirve para varias actas ni binarios. | **No aplica: el equipo no usa Firebase (ADR-002).** |

### Decisión

Se elige la alternativa **A**:

- Cada acta tiene un `client_uuid` generado en el dispositivo (clave de idempotencia) y un estado local
  `pendiente | sincronizando | sincronizada | conflicto | error`.
- La foto se guarda con `Filesystem` y la cola almacena su ruta; al sincronizar se sube primero la foto y luego se llama a la RPC
  `guardar_acta`.
- **Disparadores:** evento de `@capacitor/network` al volver la conexión, apertura de la app y botón manual.
- Reintentos con espera exponencial; los errores de validación o permiso no se reintentan y pasan a `error` con mensaje.
- **Conflictos:** cada acta tiene `version`; el cliente envía la `version_base` que conocía. Si la del servidor es mayor, la RPC no
  sobrescribe y devuelve `conflicto`. Prevalece la corrección del coordinador de recinto; el veedor ve ambas versiones y elige.
- Enviar dos veces el mismo `client_uuid` es idempotente.
- La lógica se aísla en `data/offline/` (`SyncService`); el flujo en línea funciona sin ella.

### Consecuencias

- **Beneficios:** no se pierden actas por falta de red; no hay duplicados.
- **Obligaciones:** la interfaz muestra el estado de cada acta y un contador de pendientes.
- **Riesgos:** pérdida de datos locales si se desinstala la app o el sistema limpia el almacenamiento (se advierte con el contador);
  complejidad añadida, aislada en `SyncService`.

### Verificación

- En modo avión, registrar un acta con foto la deja `pendiente`; al reactivar la red pasa a `sincronizada` sin intervención.
- Enviar dos veces el mismo `client_uuid` produce una sola fila en `actas`.
- Corregir el acta como coordinador mientras el veedor está sin conexión produce `conflicto` al sincronizar.

### Uso de IA

- **Eduardo Ganchala · Gemini:** cola local con reintentos y política determinista de conflictos. Se aceptó parcialmente.
- **Josué Ortiz · Claude (Anthropic):** caché persistente de Firestore + cola de fotos + control de versión. Se rechazó la caché (no
  aplica sin Firebase); se conserva el control por versión.
- **Verificación humana:** prueba en modo avión en un dispositivo físico, si se implementa.

### Trazabilidad

- Propuestas: propuesta de Eduardo Ganchala `ADR-009-offline-cola-sincronizacion.md` (aceptada) · `docs/adr-propuestas/ADR-006-offline-sincronizacion.md` (rechazada).
- Commit del ADR: [b0a29cb](https://github.com/NW08/Apps_GR1/commit/b0a29cb) · minutos del video: [caeff15](https://github.com/NW08/Apps_GR1/commit/caeff15)
- Commit de implementación: no aplica (R10 opcional, no implementado)

### Consenso del equipo

| Integrante | Postura y argumentos | Objeciones |
|---|---|---|
| Eduardo Ganchala | Dexie (IndexedDB), cola de pendientes, `Filesystem` para fotos y control de versiones. | Ninguna |
| Josué Ortiz | Caché de Firestore, cola de fotos y conflictos por versión. | La caché de Firestore no aplica al no usar Firebase. |

**Acuerdo final:** IndexedDB con Dexie para la cola y `@capacitor/filesystem` para las fotos, con conflictos por versión. R10 es
opcional e individual. · **Minuto del video:** 01:17:30–01:24:44 (consenso 01:24:16–01:24:44)

---

<a id="adr-007"></a>

## ADR-007: Crear las cuentas con Edge Functions de Supabase, iniciar sesión con la cédula mediante una RPC y guardar el rol en `perfiles`

| Campo | Valor |
|---|---|
| **Estado** | Aceptado |
| **Fecha** | 2026-11-24 |
| **Autor(es) y equipo** | Equipo 6: Eduardo Ganchala, Josué Ortiz |
| **Origen** | Propuesta de Eduardo Ganchala (identidad y roles de su ADR-002). Rechaza la propuesta de Josué Ortiz (su ADR-007, Cloud Functions + *custom claims*), que quedó fuera de alcance al elegir Supabase. |
| **Requisitos relacionados** | R2 (sin autorregistro; provincial → coordinador de recinto → veedor; cédula validada; confirmación de cuenta), R3 (login con cédula, contraseña inicial `Ecuador2026`, cambio obligatorio, recuperación por correo, sin claves administrativas en la app), R8 (rol y pertenencia en el servidor). |

### Contexto

No hay autorregistro: cada cuenta la crea un usuario de rol superior, lo que exige privilegios administrativos que no pueden estar en
la app. El identificador visible es la cédula, pero Supabase Auth autentica por correo. El cambio de contraseña inicial debe ser
obligatorio aun si alguien llama a la API directamente.

### Alternativas consideradas

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

### Decisión

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

### Consecuencias

- **Beneficios:** ninguna clave administrativa en el cliente; el cambio obligatorio no se puede saltar desde la API.
- **Obligaciones:** los secretos (`service_role`, SMTP) solo como secretos de las Edge Functions; desplegar las funciones con la CLI de
  Supabase o desde el panel.
- **Riesgos:** la RPC `email_por_cedula` permite enumerar cédulas registradas; se limita a devolver solo el correo y se acepta como
  riesgo documentado. El SMTP gratuito puede retrasar o filtrar correos como spam.

### Verificación

- Un veedor que llama a `crear-coordinador-recinto` recibe 403.
- Con la contraseña inicial sin cambiar, una consulta directa a `actas` con su JWT devuelve 0 filas.
- `git grep -i "service_role" -- src android` sin resultados.
- Crear un veedor envía el correo de confirmación; «¿Olvidaste tu contraseña?» envía el de recuperación.

### Uso de IA

- **Eduardo Ganchala · Gemini:** autenticación por cédula y autorización por rol en Supabase. Se aceptó.
- **Josué Ortiz · Claude (Anthropic):** Functions + *claims* + correo sintético. Se rechazó por depender de Firebase; el correo
  sintético también se descarta porque rompe la recuperación.
- **Verificación humana:** pruebas de los cuatro puntos de la sección anterior con las cuentas de demostración.

### Trazabilidad

- Propuestas: propuesta de Eduardo Ganchala `ADR-002-supabase-auth-roles.md` (aceptada) · `docs/adr-propuestas/ADR-007-identidad-cuentas-roles.md` (rechazada).
- Commit del ADR: [b0a29cb](https://github.com/NW08/Apps_GR1/commit/b0a29cb) · minutos del video: [caeff15](https://github.com/NW08/Apps_GR1/commit/caeff15)
- Commit de implementación: [00aa16a](https://github.com/NW08/Apps_GR1/commit/00aa16a)

### Consenso del equipo

| Integrante | Postura y argumentos | Objeciones |
|---|---|---|
| Eduardo Ganchala | Supabase Auth con Edge Functions, roles en `perfiles` y login por cédula con la RPC `email_por_cedula`. | — |
| Josué Ortiz | Cloud Functions con *custom claims* y login con cédula. | — |

**Acuerdo final:** Josué presentó su propuesta dentro del bloque del backend; al acordarse Supabase (ADR-002) quedó fuera de
alcance y se adoptó la de Eduardo sin debate adicional. · **Minuto del video:** 00:12:20–00:15:41, dentro del bloque del backend (consenso 00:16:23–00:17:58)

---

<a id="adr-008"></a>

## ADR-008: Usar un modelo relacional normalizado con votos en tabla hija, políticas RLS por rol y pertenencia, Storage privado estado de mesa guardado y vistas con índices para las consultas pesadas

| Campo | Valor |
|---|---|
| **Estado** | Aceptado |
| **Fecha** | 2026-11-24 |
| **Autor(es) y equipo** | Equipo 6: Eduardo Ganchala, Josué Ortiz |
| **Origen** | Propuesta de Eduardo Ganchala (su ADR-003), con el acuerdo del debate: estado de mesa guardado y vistas con índices. Rechaza la propuesta de Josué Ortiz (su ADR-008, Firestore y Security Rules). |
| **Requisitos relacionados** | R1 (datos iniciales), R4 (avance, GPS y dashboard), R5/R6 (mesas, asignación y actas), R7 (foto y GPS como campos), R8 (persistencia de datos e imágenes; aislamiento entre veedores). |

### Contexto

Existe una jerarquía provincia → recinto → JRV → acta, con votos por candidatura para alcaldía y prefectura. El dashboard necesita
sumas por candidato, por recinto y consolidadas. Las fotos son evidencia electoral y no deben ser públicas. Un veedor no puede leer ni
escribir mesas ajenas, aunque llame a la API directamente.

### Alternativas consideradas

**Votos**

| Criterio | **A. Tabla hija `acta_votos`** | B. Columnas fijas `votos_org1…5` | C. JSON dentro del acta |
|---|---|---|---|
| Agregación | `GROUP BY` directo. | Requiere *unpivot*. | Ineficiente. |
| Integridad | Claves foráneas y `CHECK`. | `CHECK` por columna. | Ninguna. |
| Escritura | Varias filas: exige transacción (RPC). | Una fila. | Una fila. |

**Estado de las mesas y consolidados**

| Criterio | A. Calcularlo en una vista en cada consulta | **B. Guardarlo en `jrv.estado` y recalcularlo al registrar el acta** |
|---|---|---|
| Consistencia | Siempre derivado de los datos. | Depende de recalcularlo en cada escritura del acta. |
| Lectura | Costo en cada consulta. | Lectura directa de la columna. |

Para los consolidados del dashboard se mantienen las vistas (ADR-009).

**Fotos:** bucket público (simple, URLs abiertas) frente a bucket **privado** con URLs firmadas (acceso por políticas).

### Decisión

**Tablas** (`supabase/migrations`):

- `recintos(id, provincia, canton, parroquia, nombre, num_jrv, lat, lng)`; al crear un recinto se generan sus `num_jrv` mesas.
- `perfiles(id = auth.uid, cedula unique, nombres, apellidos, telefono, email, rol, recinto_id, creado_por, debe_cambiar_clave)`.
- `jrv(id, recinto_id, numero, veedor_id null, estado)`.
- `organizaciones(id, nombre, lista)` · `candidaturas(id, organizacion_id, dignidad: alcalde|prefecto, nombre)`.
- `actas(id, jrv_id, dignidad, nulos, blancos, total_sufragantes, foto_path, lat, lng, precision_m, capturado_en,
  ubicacion_comprobable, estado: VALIDADA|OBSERVADA|CORREGIDA, observacion, version, client_uuid unique, actualizado_por,
  actualizado_en)` con `unique(jrv_id, dignidad)`.
- `acta_votos(acta_id, candidatura_id, votos >= 0)` · `acta_historial(acta_id, version, datos jsonb, cambiado_por, cambiado_en)`.

**Integridad:** `CHECK` de no negativos; la RPC `guardar_acta` inserta o corrige el acta y sus votos en una transacción, sube la
`version` y guarda la anterior en `acta_historial`. Un trigger rechaza el acta si `Σ votos + nulos + blancos ≠ total_sufragantes`,
salvo que esté `OBSERVADA` con observación (ADR-005).

**Estado de la mesa, vistas e índices** (acuerdo del debate): el estado de cada mesa (`PENDIENTE`, `PARCIAL`, `COMPLETA`,
`OBSERVADA`) **se guarda en `jrv.estado`** y lo recalcula un trigger cada vez que se inserta o corrige un acta; las consultas pesadas
del dashboard son vistas con `security_invoker = true` (ADR-009). Índices en
`jrv(recinto_id)`, `jrv(veedor_id)`, `actas(jrv_id)`, `acta_votos(acta_id)` y `perfiles(recinto_id)`.

**Políticas RLS** (todas exigen además `debe_cambiar_clave = false`, ADR-007):

- **Provincial:** lee todo; crea y edita recintos; lee perfiles.
- **Recinto:** lee y escribe solo filas con `recinto_id = auth_recinto_id()`: asigna veedores a sus JRV y corrige actas y fotos.
- **Veedor:** lee y escribe solo `jrv` y `actas` con `jrv.veedor_id = auth.uid()`.
- **Storage:** bucket privado `actas`, ruta `{recinto_id}/{jrv_id}/{dignidad}.jpg`; la política compara los segmentos con la
  pertenencia del usuario; acceso con URL firmada de corta duración.

**Siembra (R1):** `supabase/seed.sql` con Pichincha / Quito: recintos con cantón, parroquia, nombre y número de JRV; cinco
organizaciones ficticias; cinco candidaturas a la alcaldía y cinco a la prefectura.

### Consecuencias

- **Beneficios:** agregados con SQL; integridad en la base de datos; fotos privadas; estado de mesa siempre coherente.
- **Obligaciones:** versionar migraciones y siembra; probar las políticas por rol (ADR-010).
- **Riesgo:** una política mal escrita abre datos ajenos o bloquea a usuarios legítimos. **Mitigación:** prueba de RLS por rol antes
  de generar el APK.

### Verificación

- Como veedor A: leer la JRV o el acta de una mesa del veedor B devuelve 0 filas; insertar un acta en ella falla.
- Como coordinador del recinto X: no lee mesas del recinto Y.
- Insertar un acta con totales incoherentes y sin `OBSERVADA` devuelve el error del trigger.
- Pedir la foto sin sesión devuelve 400/403.
- `select count(*) from recintos` coincide con la siembra.

### Uso de IA

- **Eduardo Ganchala · Gemini:** esquema normalizado y políticas RLS diferenciadas por rol. Se aceptó parcialmente.
- **Josué Ortiz · Claude (Anthropic):** modelo de Firestore y Security Rules. Se rechazó por depender de Firebase; se conserva la
  matriz de permisos por rol y pertenencia.
- **Verificación humana:** el SQL de referencia del equipo se usa como guía y cada integrante escribe y prueba sus migraciones.

### Trazabilidad

- Propuestas: propuesta de Eduardo Ganchala `ADR-003-modelo-datos-storage-rls.md` (aceptada) · `docs/adr-propuestas/ADR-008-modelo-datos-reglas-acceso.md` (rechazada).
- Commit del ADR: [b0a29cb](https://github.com/NW08/Apps_GR1/commit/b0a29cb) · minutos del video: [caeff15](https://github.com/NW08/Apps_GR1/commit/caeff15)
- Commit de implementación: [d3a09fe](https://github.com/NW08/Apps_GR1/commit/d3a09fe)

### Consenso del equipo

| Integrante | Postura y argumentos | Objeciones |
|---|---|---|
| Eduardo Ganchala | Modelo normalizado con votos en tabla hija, Storage privado y RLS por rol. Propuso **vistas**. | — |
| Josué Ortiz | Reglas por rol y pertenencia. Propuso **triggers** para mantener el estado de las mesas. | — |

**Desacuerdo relevante:** calcular el estado de las mesas y los consolidados con vistas o con triggers.

**Acuerdo final:** esquema normalizado con votos en tabla hija y siembra de datos fijos conocidos; el **estado de la mesa se guarda**
al registrar el acta y se usan **vistas para las consultas más pesadas, junto con índices**. · **Minuto del video:** 00:47:03–00:58:01 (consenso 00:55:54–00:58:01)

---

<a id="adr-009"></a>

## ADR-009: Construir el dashboard con agregación en el servidor (vistas SQL), refresco manual, barras sin librería externa y mapa de OpenStreetMap

| Campo | Valor |
|---|---|
| **Estado** | Aceptado |
| **Fecha** | 2026-11-24 |
| **Autor(es) y equipo** | Equipo 6: Eduardo Ganchala, Josué Ortiz |
| **Origen** | Propuesta de Eduardo Ganchala (su ADR-010), con dos cambios del debate: las actas observadas se cuentan marcadas y con filtro, y el mapa usa OpenStreetMap. Rechaza la propuesta de Josué Ortiz (su ADR-009, agregaciones de Firestore + Chart.js). |
| **Requisitos relacionados** | R4 (avance de actas, coordenadas GPS y votos por candidato por recinto o consolidado), R8 (acceso aplicado en el backend), R9 (estados explícitos). |

### Contexto

El coordinador provincial necesita conocer el avance (actas registradas frente al total de JRV), los votos por candidatura de alcaldía
y prefectura y dónde se capturó cada acta, por recinto o consolidado. Solo el provincial accede al consolidado. Criterios: sumas
correctas, rendimiento con conexión limitada, seguridad por rol, pocas dependencias y código explicable en la defensa.

### Alternativas consideradas

| Aspecto | **Elegida** | Alternativas descartadas |
|---|---|---|
| Cálculo de totales | **A. Vistas SQL en el servidor:** el teléfono recibe decenas de filas; RLS en el mismo lugar. | B. Descargar todas las actas y sumar en la app (miles de filas, lógica duplicada). C. Contadores con triggers (riesgo de desincronización al corregir). |
| Actualización | **D. Al abrir la pantalla y con refresco manual.** | E. Supabase Realtime (complejidad y conexiones del plan Free; R4 no lo exige). |
| Presentación | **F. Barras HTML/CSS proporcionales + tabla:** sin dependencias, explicable línea por línea. | G. Chart.js / ng2-charts (dependencia y peso extra). |
| Coordenadas GPS | **I. Mapa con teselas de OpenStreetMap + lista:** sin clave de API ni costo. | H-bis. Solo enlace a Google Maps (sale de la app y depende de un servicio comercial). |
| Actas observadas | **Contarlas marcadas, con filtro para excluirlas.** | No contarlas (oculta información al coordinador); contarlas sin marca (mezcla datos dudosos). |

### Decisión

- **Vistas SQL** con `security_invoker = true` (RLS se aplica a quien consulta), en `supabase/migrations`:
  - `resultados_por_candidato_recinto(recinto_id, dignidad, candidatura_id, organizacion, votos, observada)`;
  - `resultados_blancos_nulos_recinto(recinto_id, dignidad, blancos, nulos, sufragantes)`;
  - `avance_actas_recinto(recinto_id, total_jrv, actas_alcalde, actas_prefecto, observadas, sin_ubicacion)`.
- **Consolidado:** suma de las filas por recinto en una consulta del `DashboardRepository`.
- **Actas observadas:** se cuentan en los totales y se marcan con un distintivo («Incluye N actas observadas»); un interruptor
  **«Excluir actas observadas»** recalcula los totales sin ellas.
- **Gráficos:** barras HTML con ancho proporcional (`width: calc(votos / max * 100%)`) y tabla con valores exactos.
- **Filtros:** dignidad (alcalde o prefecto) y recinto, con opción «Consolidado».
- **GPS:** pestaña «Mapa GPS» con teselas de **OpenStreetMap** (atribución visible) y un pin por acta; lista con recinto, mesa,
  fecha, coordenadas y precisión, con enlace a `https://www.openstreetmap.org/?mlat={lat}&mlon={lng}`. Las actas sin GPS aparecen
  en la lista como «Ubicación no comprobable» (ADR-003).
- **Acceso:** rutas bajo `/provincial` con `rolGuard`; RLS impide que recinto o veedor obtengan el consolidado desde la API.
- **Capas y estado:** `DashboardPage` → `ProvincialDashboardStore` → `DashboardRepository`; `Estado<T>` con cargando, vacío, error con
  reintento y hora de la última actualización (ADR-004, ADR-005).

### Consecuencias

- **Beneficios:** pocos datos al teléfono; una sola fuente de verdad con seguridad en la base de datos; sin librería de gráficos.
- **Obligaciones:** versionar las vistas; mantener la prueba de acceso por rol (ADR-010); respetar la política de uso de teselas de
  OpenStreetMap (atribución y uso moderado).
- **Riesgos:** un error en las vistas produce totales incorrectos (mitigación: comparar con la suma manual de las actas de prueba);
  datos desactualizados entre refrescos (mitigación: hora de la última actualización y botón de refresco); contar las observadas
  aumenta lecturas, objeción de Josué Ortiz (mitigación: el filtro se resuelve en la misma consulta, sin peticiones extra).

### Verificación

- Con actas de prueba fijas, `resultados_por_candidato_recinto` devuelve la suma calculada a mano.
- Activar «Excluir actas observadas» cambia los totales en exactamente los votos de las actas observadas.
- Con la sesión de un veedor o de un coordinador de recinto, las vistas no devuelven datos de otros recintos.
- Revisión en el APK: barras proporcionales y coincidentes con la tabla; el mapa muestra los pines de las actas con GPS.

### Uso de IA

- **Eduardo Ganchala · Gemini:** vistas con `security_invoker`, refresco manual, barras HTML/CSS y enlaces a Google Maps. Se aceptó;
  el mapa cambió a OpenStreetMap en el debate.
- **Josué Ortiz · Claude (Anthropic):** agregaciones `sum`/`count` de Firestore + Chart.js. Se rechazó por no usar Firebase y para
  evitar la dependencia de gráficos.
- **Verificación humana:** comparación de los totales del dashboard con la suma manual de las actas sembradas.

### Trazabilidad

- Propuestas: propuesta de Eduardo Ganchala `ADR-010-dashboard.md` (aceptada con modificaciones) · `docs/adr-propuestas/ADR-009-dashboard-consolidacion.md` (rechazada).
- Commit del ADR: [b0a29cb](https://github.com/NW08/Apps_GR1/commit/b0a29cb) · minutos del video: [caeff15](https://github.com/NW08/Apps_GR1/commit/caeff15)
- Commit de implementación: [b3654b3](https://github.com/NW08/Apps_GR1/commit/b3654b3)

### Consenso del equipo

| Integrante | Postura y argumentos | Objeciones |
|---|---|---|
| Eduardo Ganchala | Agregación en el servidor, refresco y barras sin librería. Propuso OpenStreetMap para el mapa. | — |
| Josué Ortiz | Agregaciones en el servidor con Chart.js. No quería contar las actas observadas. | Contarlas implica más costos de lectura y escritura en la base de datos. |

**Desacuerdo relevante:** cómo mostrar las actas observadas.

**Acuerdo final:** se cuentan las actas observadas pero se marcan, con un filtro para excluirlas; el mapa usa la API pública de
OpenStreetMap. · **Minuto del video:** 00:58:02–01:09:51 (consenso 01:08:34–01:09:40)

---

<a id="adr-010"></a>

## ADR-010: Probar en tres niveles (dominio, RLS de Supabase y lista manual sobre el APK), centralizar los errores y monitorear sin servicios externos

| Campo | Valor |
|---|---|
| **Estado** | Aceptado |
| **Fecha** | 2026-11-24 |
| **Autor(es) y equipo** | Equipo 6: Eduardo Ganchala, Josué Ortiz |
| **Origen** | Propuesta de Josué Ortiz (su ADR-010), orientada a Supabase. Sustituye a la propuesta de Eduardo Ganchala (su ADR-008, pruebas por capas), que coincide en errores centralizados y monitoreo ligero. |
| **Requisitos relacionados** | R8 (demostrar que un veedor no accede a mesas ajenas), R2/R3 (cuentas y acceso), R6/R7 (actas, cámara y GPS), R9 (estados de error). |

### Contexto

No es viable una cobertura completa ni E2E automatizadas en Android en el plazo. Hay que elegir qué probar automáticamente para
obtener evidencia de lo que más pesa: actas y veedor (4,2), acceso y roles (2,2) y seguridad (1,8). El resto se cubre con una prueba
manual reproducible, y la app debe fallar de forma controlada con mensajes útiles.

### Alternativas consideradas

| Criterio | **A. Tres niveles: unitarias del dominio + pruebas de RLS + lista manual sobre el APK** | B. Unitarias de componentes con TestBed | C. E2E automatizadas (Playwright o Appium) |
|---|---|---|---|
| Evidencia para R8 | **Directa** (RLS contra Supabase). | Ninguna. | Indirecta. |
| Esfuerzo | Bajo/medio. | Alto (simular Ionic y Supabase). | Alto y frágil. |
| Cubre cámara y GPS | Con la lista manual. | No. | Parcial. |

### Decisión

#### Nivel 1: dominio (unitarias con el runner por defecto de Angular CLI 22)

- `domain/rules/cedula.spec.ts`, `acta-consistency.spec.ts`, `device/image-quality.util.spec.ts`, `core/errors/supabase-error.mapper.spec.ts`.
- Cada regla con casos válidos, inválidos y límite.

#### Nivel 2: seguridad (RLS de Supabase)

- `npm run test:rls`: script con `@supabase/supabase-js` que inicia sesión con las cuentas de demostración (solo `anon key`, nunca
  `service_role`) y comprueba la matriz de ADR-008:
  - veedor A no lee la JRV, el acta ni la foto de una mesa del veedor B, y no puede insertar en ella;
  - coordinador del recinto X no lee mesas del recinto Y;
  - un veedor no obtiene el consolidado ni puede llamar a `crear-coordinador-recinto` (403);
  - un acta incoherente sin `OBSERVADA` es rechazada por el trigger.
- Los casos de consistencia son los mismos que en `acta-consistency.spec.ts`, para que la regla del cliente y la del servidor no
  diverjan.

#### Nivel 3: lista manual sobre el APK final (acordado en el debate)

- `docs/pruebas-manuales.md`, ejecutada sobre el APK instalado en un dispositivo físico, con pasos, resultado esperado, resultado
  obtenido, fecha, modelo y captura.
- **Casos mínimos:** login con cédula; cambio obligatorio; recuperación por correo; crear coordinador y veedor; asignar y reasignar
  veedor; acta consistente, inconsistente y observada; foto borrosa rechazada; permisos de cámara y GPS denegados; veedor que intenta
  abrir una mesa ajena; dashboard y mapa GPS; modo avión (si se implementa R10).

#### Errores

- `GlobalErrorHandler` + `supabase-error.mapper.ts` (ADR-005): ningún error llega al usuario como código técnico; todos tienen un
  mensaje en español y, si aplica, «Reintentar». Las páginas no tienen `try/catch` sueltos: los servicios devuelven `Estado<T>`.

#### Monitoreo

- Sin servicio externo: `console.error` estructurado (Logcat o `chrome://inspect`), registros de Postgres y de Edge Functions en el
  panel de Supabase. Un servicio de *crash reporting* queda como trabajo futuro por tiempo.

### Consecuencias

- **Beneficios:** la evidencia de R8 es un script que se ejecuta en vivo en la defensa; las reglas de negocio están probadas en ambos
  lados; la lista manual documenta el funcionamiento en Android.
- **Obligaciones:** mantener las cuentas de demostración y `docs/pruebas-manuales.md` con el APK final.
- **Limitaciones:** las páginas no tienen pruebas automáticas; la UI se valida a mano.
- **Riesgo:** las pruebas de RLS pasan contra una versión de las migraciones distinta de la desplegada. **Mitigación:** aplicar las
  migraciones al proyecto real y ejecutar `npm run test:rls` contra ese proyecto antes de generar el APK.

### Verificación

- `npm test` y `npm run test:rls` en verde, con capturas en `docs/evidencias/`.
- `docs/pruebas-manuales.md` completo, con fecha y modelo del dispositivo.
- README con la sección «Pruebas» y sus comandos.

### Uso de IA

- **Josué Ortiz · Claude (Anthropic):** estrategia de pruebas viable en el plazo; sugirió la pirámide reducida. Se aceptó; el nivel 2
  pasa del emulador de Firebase a pruebas de RLS en Supabase.
- **Eduardo Ganchala · Gemini:** pruebas por capas, errores centralizados y monitoreo ligero. Se integra en errores y monitoreo.
- **Verificación humana:** ejecución de la lista manual sobre el APK en un dispositivo físico.

### Trazabilidad

- Propuestas: `docs/adr-propuestas/ADR-010-pruebas-errores-monitoreo.md` (aceptada) · propuesta de Eduardo Ganchala `ADR-008-pruebas-errores-monitoreo.md` (sustituida).
- Commit del ADR: [b0a29cb](https://github.com/NW08/Apps_GR1/commit/b0a29cb) · minutos del video: [caeff15](https://github.com/NW08/Apps_GR1/commit/caeff15)
- Commit de implementación: [be0ad16](https://github.com/NW08/Apps_GR1/commit/be0ad16)

### Consenso del equipo

| Integrante | Postura y argumentos | Objeciones |
|---|---|---|
| Josué Ortiz | Tres niveles; propuso que el nivel 3 sean pruebas manuales sobre el APK final. | — |
| Eduardo Ganchala | Pruebas por capas, errores centralizados y monitoreo ligero. Estuvo de acuerdo con el nivel 3 sobre el APK. | Ninguna |

**Desacuerdo relevante:** qué es lo mínimo que hay que probar.

**Acuerdo final:** pruebas en tres niveles orientadas a Supabase, con el nivel 3 como pruebas manuales sobre el APK final. ·
**Minuto del video:** 01:09:52–01:17:29 (consenso 01:16:41–01:17:25)
