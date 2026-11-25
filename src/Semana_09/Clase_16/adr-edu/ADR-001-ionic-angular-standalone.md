# ADR-001: Se adoptó Ionic Angular (standalone) como framework de la aplicación

## Estado
Aceptado

## Fecha
2026-11-22

## Autor(es) y equipo
[Eduardo Ganchala] · Equipo [6]
## Requisitos relacionados
- R9: se requirió separación de capas, estado y estados explícitos de UI.
- R7 / Sección 10: se exigió Capacitor para cámara y GPS y compilación para Android.
- R10: la sincronización se apoyó en RxJS.

## Contexto
El enunciado admitió únicamente Ionic Angular (standalone) o Ionic React, y la elección debió ser única para todo el equipo. La aplicación contó con tres roles, formularios con validación cruzada (suma de votos contra total de sufragantes), rutas protegidas por rol y una cola de sincronización opcional. Los criterios fueron el soporte nativo de formularios reactivos y validadores, la inyección de dependencias para separar capas, la curva de aprendizaje del equipo y la facilidad de explicar el código en la defensa.

## Alternativas consideradas
**A. Ionic Angular standalone**
- Ventajas: contó con `ReactiveFormsModule` con validadores síncronos y de grupo, ideal para la consistencia de totales; la inyección de dependencias impuso servicios separados de las páginas; el Router con guards funcionales permitió el control por rol; RxJS y Signals sirvieron para el estado y la sincronización; la estructura prescriptiva facilitó acordar la línea base.
- Desventajas: implicó más código repetitivo y una curva de aprendizaje de RxJS y de la inyección de dependencias.

**B. Ionic React**
- Ventajas: requirió menos código base, usó hooks sencillos y contó con un ecosistema amplio.
- Desventajas: los formularios y la validación exigieron librerías extra (React Hook Form + Zod); la separación en capas dependió de la disciplina de cada integrante, con mayor riesgo de divergencia entre las implementaciones individuales; la protección de rutas debió armarse a mano.

## Decisión
Se eligió **Ionic Angular con componentes standalone** (sin NgModules), con la versión vigente de Angular soportada por Ionic, TypeScript en modo `strict` y Capacitor para Android. Se utilizaron `provideRouter` con `loadComponent` (carga diferida) y `provideHttpClient` cuando fue necesario.

## Consecuencias
- Beneficios: se obtuvo validación y DI integradas, con menos dependencias externas.
- Obligaciones: todos los integrantes debieron usar `standalone: true`, `strict` y la misma versión mayor de Angular/Ionic fijada en `package.json`.
- Riesgo: se identificó una mayor curva de aprendizaje, por lo que un integrante con más experiencia en React podría rendir menos. Se mitigó con una plantilla de proyecto común generada con `ionic start` y revisada en equipo.

## Verificación
- Se definió que `ng build` y `ionic cap sync android` debían terminar sin errores.
- Se definió que `grep -R "NgModule" src/` no debía devolver resultados.
- Se definió que `tsconfig.json` debía contener `"strict": true`.

## Uso de IA
- Herramienta: [Gemini IA]. Se consultó la comparación entre Angular y React para este enunciado.
- Respuesta sugerida: Se recomendó Angular por los formularios reactivos y la DI.
- Aceptación/Rechazo: Aceptado. El equipo adoptará Ionic Angular standalone para facilitar la validación cruzada y la separación de capas sin añadir librerías externas. 
- Verificación humana: el equipo creará el proyecto base con `ionic start` en modo standalone, comprobará `"strict": true` en `tsconfig.json` y verificará que `ng build` e `ionic cap sync android` compilarán sin errores.
## Trazabilidad
- Commit del ADR: git commit -m "docs(adr): propuestas ADR-001 a ADR-010"
- Commit de implementación: Pendiente

## Consenso del equipo
Pendiente
