# ADR-008: Se adoptaron pruebas por capas, gestión centralizada de errores y monitoreo ligero

## Estado
Rechazado
## Fecha
2026-11-22

## Autor(es) y equipo
[Eduardo Ganchala] · Equipo [6]
## Requisitos relacionados
- R8: demostrar que un veedor no accede a mesas ajenas.
- R9: estados explícitos de error.
- R7: errores de cámara y ubicación.


## Contexto
Se contó con cinco días de desarrollo individual. La prioridad de las pruebas fue la seguridad (RLS), las validaciones y los flujos críticos del veedor. Los errores pudieron provenir de la red, el backend, los permisos del dispositivo o la validación, y el usuario debió recibir mensajes comprensibles.

## Alternativas consideradas
**Pruebas**
- A. Unitarias (Jasmine/Karma o Jest) de validadores y servicios, pruebas SQL de RLS y una lista de verificación manual en dispositivo.
  - Ventajas: cubrió lo de mayor riesgo con poco costo.
  - Desventajas: no cubrió automáticamente la interfaz.
- B. Además, pruebas end-to-end con Cypress/Playwright.
  - Ventajas: cubrieron flujos completos.
  - Desventajas: la configuración fue costosa para un APK y el tiempo fue escaso.

**Monitoreo**
- C. `LoggerService` propio y registros del panel de Supabase.
  - Ventajas: no añadió dependencias nuevas.
  - Desventajas: no hubo alertas ni reportes de fallos del APK.
- D. Sentry/Crashlytics.
  - Ventajas: reportó fallos reales.
  - Desventajas: añadió una dependencia y configuración nativa, con riesgo de filtrar datos.

## Decisión
Se eligió la combinación **A + C**.
- Pruebas: se definieron pruebas unitarias de validadores, `ActaService`, guards y `sharpness`; scripts SQL de RLS en `supabase/tests`; y una lista manual de verificación en el README (por rol, sin red, permisos denegados).
- Errores: se creó `AppError` con `codigo`, `mensajeUsuario` y `causa`; un `ErrorMapper` convirtió los errores de Supabase, red y plugins en `AppError`; el `ErrorHandler` global de Angular los registró y mostró un toast; los servicios nunca mostraron mensajes técnicos.
- Monitoreo: se creó un `LoggerService` con niveles; en producción solo se registraron `warn` y `error`, sin datos personales ni cédulas.

## Consecuencias
- Beneficios: la cobertura se concentró donde estuvo el riesgo y los mensajes fueron coherentes.
- Obligaciones: se debió mantener actualizada la lista de verificación.
- Riesgo: los fallos de interfaz pudieron no detectarse automáticamente. Se mitigó con la lista manual ejecutada antes de generar el APK.

## Verificación
- Se definió que `ng test` debía quedar en verde y que `psql -f supabase/tests/rls.sql` no debía registrar fallos.
- Se definió que, al apagar el Wi-Fi y guardar un acta, debía aparecer un mensaje de error o de pendiente (si se implementó R10), nunca una pantalla en blanco.
- Se definió que `grep -R "console.log" src/` no debía mostrar datos sensibles.

## Uso de IA
- Herramienta: [Gemini IA]. Se consultó la estrategia de pruebas mínima viable y la gestión de errores.
- Respuesta sugerida: la herramienta recomienda enfocar las pruebas unitarias en validadores críticos (cédula y suma de votos), añadir pruebas de políticas RLS y centralizar el manejo de errores con mensajes claros en la UI. 
- Aceptación/Rechazo: Aceptado. El equipo aplicará esta estrategia de pruebas y gestión centralizada de errores para cubrir los flujos críticos dentro del tiempo disponible.
- Verificación humana: el equipo ejecutará la suite de pruebas antes de cada entrega y comprobará que los errores de red, permisos y validación mostrarán mensajes comprensibles para el usuario.

## Trazabilidad
- Commit del ADR: git commit -m "docs(adr): propuestas ADR-001 a ADR-010"
- Commit de implementación: Pendiente

## Consenso del equipo
Pendiente
