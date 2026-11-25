# ADR-001: Usar Ionic Angular (componentes standalone) con Capacitor como framework de la aplicación

| Campo | Valor |
|---|---|
| **Estado** | Aceptado |
| **Fecha** | 2026-11-23 |
| **Autor(es) y equipo** | Josué Ortiz · Equipo 6: Eduardo Ganchala, Josué Ortiz |
| **Requisitos relacionados** | R9 (separación de capas, estado, UX), R7 (Capacitor para cámara y GPS), R1–R8 (todo el desarrollo depende de esta elección). Sección 10 del enunciado: solo se admiten Ionic Angular standalone o Ionic React. |

## Contexto

Cada integrante entrega su propia aplicación, pero con la **misma línea base tecnológica**. Hay que elegir uno de los dos frameworks
permitidos. Restricciones y criterios:

- **Plazo:** 4 días (21 → 25 de noviembre, 14:00) para desarrollar, probar y generar el APK.
- **Entrega:** APK Android instalable, compilado con Capacitor y Android Studio.
- **Arquitectura:** se evalúa explícitamente la separación entre presentación, lógica de negocio y acceso a datos (R9). La facilidad
  para imponer esa separación es un criterio.
- **Formularios:** muchos y con validaciones cruzadas (actas con totales, cédula, cuentas).
- **Defensa:** cada integrante debe explicar y modificar su código. Conviene la tecnología que el equipo ya domina.

## Alternativas consideradas

| Criterio | **A. Ionic Angular standalone** | B. Ionic React |
|---|---|---|
| Experiencia previa del equipo | Ambos integrantes la conocen y es el framework con el que se han desarrollado todos los proyectos del curso hasta ahora. | Ambos integrantes tienen experiencia, pero no se ha usado en los proyectos del curso. |
| Separación de capas | Inyección de dependencias nativa: los servicios y repositorios se inyectan en las páginas; la separación es natural y la impone el propio framework. | Se logra con hooks y contextos, pero depende de la disciplina del equipo; no hay inyección de dependencias. |
| Formularios y validación | Reactive Forms tipados incluidos, con validadores de grupo (ideales para «la suma de votos = total»). | Requiere elegir librerías (React Hook Form + Zod/Yup): más decisiones y más dependencias. |
| Estado | Signals incluidos en el framework; RxJS para los flujos de Firebase. | useState/useReducer o librerías (Zustand, Redux Toolkit). |
| Navegación y guardas | Router de Angular con `canActivate` funcional por rol y lazy loading de componentes standalone. | React Router + `IonReactRouter`; las guardas se hacen a mano con componentes envoltorio. |
| Curva y peso | Más conceptos (DI, decoradores, RxJS) y un bundle algo mayor. | Más ligera de arrancar; menos «ceremonia». |
| Integración con Capacitor | Idéntica en ambos (los plugins son agnósticos al framework). | Idéntica. |

## Decisión

Se elige **Ionic Angular con componentes standalone** (sin NgModules), con **Capacitor** para el empaquetado Android y los plugins nativos.

- Versiones estables vigentes de Angular, Ionic y Capacitor al iniciar el proyecto, fijadas en `package.json`. Todos los integrantes
  usan las mismas versiones mayores.
- Proyecto creado con `ionic start <app> tabs --type=angular` (o `blank`), con la opción **standalone**.
- `bootstrapApplication` en `main.ts` con `provideIonicAngular()`, `provideRouter(routes, withPreloading(...))` y los providers de Firebase.
- Plataforma: solo Android (`npx cap add android`), compilada en Android Studio.

## Consecuencias

- **Beneficios:**
  - La DI de Angular permite que las páginas no conozcan Firebase: lo esconden los repositorios (ADR-004).
  - Los formularios reactivos cubren R2, R3 y R6 sin librerías extra.
  - Las guardas de ruta soportan el control de acceso en la interfaz; el control real está en el backend (ADR-008).
- **Obligaciones:** todo componente es `standalone: true` con sus `imports` explícitos (componentes de `@ionic/angular/standalone`).
  No se mezclan NgModules.
- **Limitaciones:** el bundle es mayor que en React; irrelevante para un APK.
- **Riesgo:** al importar los componentes de Ionic uno por uno (`IonButton`, `IonList`…), olvidar un import produce errores en
  tiempo de ejecución, como un elemento que no se renderiza o un icono que no aparece (los iconos se registran con `addIcons`).
  **Mitigación:** probar cada pantalla en el navegador (`ionic serve`) antes de compilar para Android, y revisar la consola.

## Verificación

- `package.json` contiene `@angular/core`, `@ionic/angular` y `@capacitor/core` en las versiones acordadas y **no** existe ningún `*.module.ts`.
- `src/main.ts` usa `bootstrapApplication` y `provideIonicAngular`.
- `ionic build && npx cap sync android` termina sin errores y Android Studio genera el APK (`app-debug.apk` o firmado).
- La app abre en un dispositivo Android físico.

## Uso de IA

- **Herramienta:** Claude (Anthropic).
- **Consulta:** «Crea los ADR para el examen; planeo usar Angular standalone, Ionic, Capacitor, Android Studio y Firebase».
- **Respuesta sugerida:** este documento con la comparación A/B.
- **Aceptación / rechazo:** se aceptó la comparación A/B y la elección de Ionic Angular standalone. Tras la deliberación, lo único
  que cambia en esta decisión es el backend que se registra en `main.ts`: Supabase en lugar de Firebase (ADR-002).
- **Verificación humana:** ambos integrantes contrastaron la comparación con su experiencia en el curso. Se verificará con
  `ionic info` que las versiones coinciden y que `ionic build && npx cap sync android` compila sin errores.

## Trazabilidad

- Commit del ADR: [enlace]
- Commit de implementación: [enlace al commit que crea el proyecto Ionic en el repositorio individual]

## Consenso del equipo

| Integrante | Postura y argumentos | Objeciones |
|---|---|---|
| Josué Ortiz | Angular standalone: la inyección de dependencias permite que las páginas no conozcan el backend (repositorios, ADR-004) y los Reactive Forms tipados resuelven la validación cruzada de las actas sin librerías extra. | Ninguna |
| Eduardo Ganchala | Angular standalone: formularios reactivos con validadores de grupo, inyección de dependencias para separar capas y menor riesgo de divergencia entre las implementaciones individuales. | Ninguna |

**Acuerdo final:** Ionic Angular standalone con Capacitor, por unanimidad. Ambos conocen también React, pero se prioriza el framework
con el que se ha trabajado todo el curso, lo que reduce el riesgo en un plazo de 4 días y facilita la defensa. ·
**Minuto del video:** [mm:ss–mm:ss]
