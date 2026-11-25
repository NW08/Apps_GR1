# ADR-001: Usar Ionic Angular (componentes standalone) con Capacitor como framework de la aplicación

| Campo | Valor |
|---|---|
| **Estado** | Aceptado |
| **Fecha** | 2026-11-24 |
| **Autor(es) y equipo** | Equipo 6: Eduardo Ganchala, Josué Ortiz |
| **Origen** | Propuesta común: ADR-001 de Josué Ortiz y ADR-001 de Eduardo Ganchala (ambas eligen Angular standalone) |
| **Requisitos relacionados** | R9 (separación de capas, estado, UX), R7 (Capacitor para cámara y GPS), R1–R8 (todo el desarrollo depende de esta elección). Sección 10 del enunciado: solo se admiten Ionic Angular standalone o Ionic React. |

## Contexto

Cada integrante entrega su propia aplicación, pero con la misma línea base tecnológica, y hay que elegir uno de los dos frameworks
permitidos. Criterios:

- **Plazo:** del 21 al 25 de noviembre para desarrollar, probar y generar el APK.
- **Arquitectura:** se evalúa la separación entre presentación, lógica de negocio y acceso a datos (R9).
- **Formularios:** muchos y con validaciones cruzadas (actas con totales, cédula, cuentas).
- **Defensa:** cada integrante debe explicar y modificar su código en vivo.

## Alternativas consideradas

| Criterio | **A. Ionic Angular standalone** | B. Ionic React |
|---|---|---|
| Experiencia del equipo | Ambos la conocen; es el framework de todos los proyectos del curso. | Ambos tienen experiencia, pero no se ha usado en el curso. |
| Separación de capas | Inyección de dependencias nativa: los repositorios se inyectan en los servicios y estos en las páginas. | Hooks y contextos; depende de la disciplina de cada integrante, con más riesgo de divergencia. |
| Formularios y validación | Reactive Forms tipados con validadores de grupo («suma de votos = total»). | Requiere librerías extra (React Hook Form + Zod). |
| Estado | Signals incluidos en el framework. | `useState`/`useReducer` o librerías (Zustand, Redux Toolkit). |
| Navegación y guardas | Router con `CanActivateFn` por rol y carga diferida con `loadComponent`. | React Router + `IonReactRouter`; guardas hechas a mano. |
| Curva y peso | Más conceptos (DI, decoradores) y un bundle algo mayor. | Más ligera de arrancar. |
| Integración con Capacitor | Idéntica en ambos. | Idéntica. |

## Decisión

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

## Consecuencias

- **Beneficios:** la DI permite que las páginas no conozcan el backend (ADR-004); los formularios reactivos cubren R2, R3 y R6 sin
  librerías; las guardas soportan la navegación por rol (el control real está en el backend, ADR-008).
- **Obligaciones:** todo componente es standalone con sus `imports` explícitos de `@ionic/angular/standalone`; misma versión mayor
  de Angular, Ionic y Capacitor en los dos repositorios.
- **Limitaciones:** bundle mayor que en React; irrelevante para un APK.
- **Riesgo:** al importar los componentes de Ionic uno a uno, olvidar un import o un icono (`addIcons`) produce elementos que no se
  renderizan. **Mitigación:** probar cada pantalla con `ionic serve` y revisar la consola antes de compilar para Android.

## Verificación

- `ionic info` muestra las versiones de la tabla en ambos equipos.
- `grep -R "NgModule" src/` sin resultados; `tsconfig.json` con `"strict": true`.
- `ionic build && npx cap sync android` termina sin errores y Gradle genera el APK.

## Uso de IA

- **Josué Ortiz · Claude (Anthropic):** comparación A/B para Angular standalone, Ionic, Capacitor y Android Studio. Se aceptó sin
  cambios de fondo.
- **Eduardo Ganchala · Gemini:** comparación de Angular y React para el enunciado; recomendó Angular por formularios reactivos y DI.
  Se aceptó.
- **Verificación humana:** ambos contrastaron la comparación con su experiencia en el curso; las versiones se verificaron en el
  registro de npm y en el `build.gradle` de `@capacitor/android` 8.6 (Java 21).

## Trazabilidad

- Propuestas: `docs/adr-propuestas/ADR-001-ionic-angular-standalone.md` · propuesta de Eduardo Ganchala `ADR-001-ionic-angular-standalone.md`.
- Commit del ADR: [b0a29cb](https://github.com/NW08/Apps_GR1/commit/b0a29cb) · minutos del video: [caeff15](https://github.com/NW08/Apps_GR1/commit/caeff15)
- Commit de implementación: [9b229e5](https://github.com/NW08/Apps_GR1/commit/9b229e5)

## Consenso del equipo

| Integrante | Postura y argumentos | Objeciones |
|---|---|---|
| Josué Ortiz | Angular standalone: la DI oculta el backend tras repositorios y los Reactive Forms tipados resuelven la validación cruzada. | Ninguna |
| Eduardo Ganchala | Angular standalone: formularios reactivos, DI para separar capas y menor riesgo de divergencia entre implementaciones. | Ninguna |

**Acuerdo final:** Ionic Angular standalone con Capacitor, por unanimidad; se prioriza el framework de todo el curso. ·
**Minuto del video:** 00:00:43–00:05:06
