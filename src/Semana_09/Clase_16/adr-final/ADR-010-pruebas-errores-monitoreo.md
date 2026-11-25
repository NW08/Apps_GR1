# ADR-010: Probar en tres niveles (dominio, RLS de Supabase y lista manual sobre el APK), centralizar los errores y monitorear sin servicios externos

| Campo | Valor |
|---|---|
| **Estado** | Aceptado |
| **Fecha** | 2026-11-24 |
| **Autor(es) y equipo** | Equipo 6: Eduardo Ganchala, Josué Ortiz |
| **Origen** | Propuesta de Josué Ortiz (su ADR-010), orientada a Supabase. Sustituye a la propuesta de Eduardo Ganchala (su ADR-008, pruebas por capas), que coincide en errores centralizados y monitoreo ligero. |
| **Requisitos relacionados** | R8 (demostrar que un veedor no accede a mesas ajenas), R2/R3 (cuentas y acceso), R6/R7 (actas, cámara y GPS), R9 (estados de error). |

## Contexto

No es viable una cobertura completa ni E2E automatizadas en Android en el plazo. Hay que elegir qué probar automáticamente para
obtener evidencia de lo que más pesa: actas y veedor (4,2), acceso y roles (2,2) y seguridad (1,8). El resto se cubre con una prueba
manual reproducible, y la app debe fallar de forma controlada con mensajes útiles.

## Alternativas consideradas

| Criterio | **A. Tres niveles: unitarias del dominio + pruebas de RLS + lista manual sobre el APK** | B. Unitarias de componentes con TestBed | C. E2E automatizadas (Playwright o Appium) |
|---|---|---|---|
| Evidencia para R8 | **Directa** (RLS contra Supabase). | Ninguna. | Indirecta. |
| Esfuerzo | Bajo/medio. | Alto (simular Ionic y Supabase). | Alto y frágil. |
| Cubre cámara y GPS | Con la lista manual. | No. | Parcial. |

## Decisión

### Nivel 1: dominio (unitarias con el runner por defecto de Angular CLI 22)

- `domain/rules/cedula.spec.ts`, `acta-consistency.spec.ts`, `device/image-quality.util.spec.ts`, `core/errors/supabase-error.mapper.spec.ts`.
- Cada regla con casos válidos, inválidos y límite.

### Nivel 2: seguridad (RLS de Supabase)

- `npm run test:rls`: script con `@supabase/supabase-js` que inicia sesión con las cuentas de demostración (solo `anon key`, nunca
  `service_role`) y comprueba la matriz de ADR-008:
  - veedor A no lee la JRV, el acta ni la foto de una mesa del veedor B, y no puede insertar en ella;
  - coordinador del recinto X no lee mesas del recinto Y;
  - un veedor no obtiene el consolidado ni puede llamar a `crear-coordinador-recinto` (403);
  - un acta incoherente sin `OBSERVADA` es rechazada por el trigger.
- Los casos de consistencia son los mismos que en `acta-consistency.spec.ts`, para que la regla del cliente y la del servidor no
  diverjan.

### Nivel 3: lista manual sobre el APK final (acordado en el debate)

- `docs/pruebas-manuales.md`, ejecutada sobre el APK instalado en un dispositivo físico, con pasos, resultado esperado, resultado
  obtenido, fecha, modelo y captura.
- **Casos mínimos:** login con cédula; cambio obligatorio; recuperación por correo; crear coordinador y veedor; asignar y reasignar
  veedor; acta consistente, inconsistente y observada; foto borrosa rechazada; permisos de cámara y GPS denegados; veedor que intenta
  abrir una mesa ajena; dashboard y mapa GPS; modo avión (si se implementa R10).

### Errores

- `GlobalErrorHandler` + `supabase-error.mapper.ts` (ADR-005): ningún error llega al usuario como código técnico; todos tienen un
  mensaje en español y, si aplica, «Reintentar». Las páginas no tienen `try/catch` sueltos: los servicios devuelven `Estado<T>`.

### Monitoreo

- Sin servicio externo: `console.error` estructurado (Logcat o `chrome://inspect`), registros de Postgres y de Edge Functions en el
  panel de Supabase. Un servicio de *crash reporting* queda como trabajo futuro por tiempo.

## Consecuencias

- **Beneficios:** la evidencia de R8 es un script que se ejecuta en vivo en la defensa; las reglas de negocio están probadas en ambos
  lados; la lista manual documenta el funcionamiento en Android.
- **Obligaciones:** mantener las cuentas de demostración y `docs/pruebas-manuales.md` con el APK final.
- **Limitaciones:** las páginas no tienen pruebas automáticas; la UI se valida a mano.
- **Riesgo:** las pruebas de RLS pasan contra una versión de las migraciones distinta de la desplegada. **Mitigación:** aplicar las
  migraciones al proyecto real y ejecutar `npm run test:rls` contra ese proyecto antes de generar el APK.

## Verificación

- `npm test` y `npm run test:rls` en verde, con capturas en `docs/evidencias/`.
- `docs/pruebas-manuales.md` completo, con fecha y modelo del dispositivo.
- README con la sección «Pruebas» y sus comandos.

## Uso de IA

- **Josué Ortiz · Claude (Anthropic):** estrategia de pruebas viable en el plazo; sugirió la pirámide reducida. Se aceptó; el nivel 2
  pasa del emulador de Firebase a pruebas de RLS en Supabase.
- **Eduardo Ganchala · Gemini:** pruebas por capas, errores centralizados y monitoreo ligero. Se integra en errores y monitoreo.
- **Verificación humana:** ejecución de la lista manual sobre el APK en un dispositivo físico.

## Trazabilidad

- Propuestas: `adr-mio/ADR-010-pruebas-errores-monitoreo.md` (aceptada) · `adr-edu/ADR-008-pruebas-errores-monitoreo.md` (sustituida).
- Commit del ADR: [enlace]
- Commit de implementación: [enlace: specs, `scripts/test-rls`, `docs/pruebas-manuales.md`]

## Consenso del equipo

| Integrante | Postura y argumentos | Objeciones |
|---|---|---|
| Josué Ortiz | Tres niveles; propuso que el nivel 3 sean pruebas manuales sobre el APK final. | — |
| Eduardo Ganchala | Pruebas por capas, errores centralizados y monitoreo ligero. Estuvo de acuerdo con el nivel 3 sobre el APK. | Ninguna |

**Desacuerdo relevante:** qué es lo mínimo que hay que probar.

**Acuerdo final:** pruebas en tres niveles orientadas a Supabase, con el nivel 3 como pruebas manuales sobre el APK final. ·
**Minuto del video:** 01:09:52–01:17:29 (consenso 01:16:41–01:17:25)
