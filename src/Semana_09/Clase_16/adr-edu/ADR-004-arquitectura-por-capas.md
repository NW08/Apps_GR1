# ADR-004: Se adoptó una arquitectura por capas con organización por funcionalidades

## Estado
Rechazado

## Fecha
2026-11-22

## Autor(es) y equipo
[Eduardo Ganchala] · Equipo [6]
## Requisitos relacionados
- R9: se requirió separar presentación, lógica de negocio y acceso a datos.
- R6: la validación de totales se consideró una regla de negocio.
- R8: las reglas de acceso se aplicaron en el backend.

## Contexto
La aplicación contó con tres roles y cuatro dominios (usuarios, recintos/JRV, actas, dashboard). Si las páginas hubieran llamado directamente a Supabase, la lógica habría quedado mezclada con la interfaz, no se habría podido probar sin red y cambiar de backend habría obligado a reescribir pantallas. Los criterios fueron la testabilidad, la claridad para explicar en la defensa y el bajo costo de ceremonia.

## Alternativas consideradas
**A. Tres capas con repositorios (presentación → servicios de dominio → repositorios)**
- Ventajas: la lógica de negocio (validación de totales, reglas de asignación) se pudo probar sin UI ni red; el repositorio aisló Supabase y permitió sustituirlo en pruebas; se alineó con la pregunta de defensa sobre responsabilidades.
- Desventajas: implicó más archivos y el riesgo de capas "pasamanos" sin lógica.

**B. Páginas que invocan directamente el cliente de Supabase**
- Ventajas: requirió menos código y fue rápida al inicio.
- Desventajas: duplicó la validación en pantallas, dificultó las pruebas y acopló totalmente al backend.

**C. Clean Architecture completa (casos de uso, entidades, puertos)**
- Ventajas: ofreció el máximo desacoplamiento.
- Desventajas: resultó sobredimensionada para el plazo de cinco días.

## Decisión
Se eligió la alternativa **A**, organizada por funcionalidad:

```
src/app/
  core/            (supabase.client.ts, guards, interceptores, logger, error-handler)
  shared/          (componentes reutilizables, validadores, pipes)
  features/
    auth/          pages/ · services/ · models/
    recintos/      pages/ · services/ · repositories/ · models/
    actas/         pages/ · services/ · repositories/ · models/
    usuarios/      ...
    dashboard/     ...
```

Se establecieron las reglas de dependencia: las páginas solo inyectaron servicios de dominio; los servicios solo inyectaron repositorios; solo los repositorios importaron `SupabaseClient`. Los modelos fueron interfaces TypeScript sin dependencias.

## Consecuencias
- Beneficios: la lógica quedó aislada y probable, y el cambio de backend quedó contenido en los repositorios.
- Obligaciones: se debieron respetar las reglas de dependencia.
- Riesgo: se identificó el peligro de capas vacías que solo delegaran. Se mitigó con un repositorio por agregado y no por tabla.

## Verificación
- Se definió que `grep -R "supabase" src/app/features/**/pages` no debía mostrar importaciones del cliente.
- Se establecieron pruebas unitarias de `ActaService` con un repositorio simulado, sin red.
- Se configuró una regla ESLint `no-restricted-imports` que impidió importar `@supabase/supabase-js` fuera de `repositories/` y `core/`.

## Uso de IA
- Herramienta: [Gemini IA]. Se consultó la estructura de carpetas por capas para Ionic Angular.
- Respuesta sugerida: la herramienta sugiere organizar el proyecto en capas (`core/`, `features/`, `shared/` y servicios de datos) para desacoplar la lógica de negocio de las páginas standalone.
- Aceptación/Rechazo: Aceptado. El equipo implementará esta separación por capas para mantener ordenado el código y facilitar el trabajo paralelo. 
- Verificación humana: el equipo comprobará que la estructura funcionará correctamente con carga diferida (`loadComponent`) y permitirá a los integrantes desarrollar módulos sin conflictos frecuentes de integración.

## Trazabilidad
- Commit del ADR: git commit -m "docs(adr): propuestas ADR-001 a ADR-010"
- Commit de implementación: Pendiente

## Consenso del equipo
Pendiente
