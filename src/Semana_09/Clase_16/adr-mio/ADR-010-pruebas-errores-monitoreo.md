# ADR-010: Probar en tres niveles (reglas de dominio, reglas de seguridad con el emulador y lista manual en Android) y centralizar la gestión de errores

| Campo                       | Valor                                                                                                                                                                                                                                                                                              |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Estado** | Aceptado (las pruebas de reglas se hacen contra las políticas RLS de Supabase en lugar del emulador de Firebase, ADR-002) |
| **Fecha**                   | 2026-11-23                                                                                                                                                                                                                                                                                         |
| **Autor(es) y equipo**      | Josué Ortiz · Equipo 6: Eduardo Ganchala, Josué Ortiz                                                                                                                                                                                                                                                     |
| **Requisitos relacionados** | R8 (demostrar el aislamiento del veedor), R6 (consistencia de totales), R2/R3 (validaciones y cuentas), R7 (permisos y errores de dispositivo), R9 (estados de error visibles). Entregable: README con la sección de pruebas; defensa: «¿dónde se implementa una validación y cómo se comprueba?». |

## Contexto

Con 4 días de plazo no es viable una cobertura completa ni pruebas E2E automatizadas en Android. Hay que elegir **qué probar
automáticamente** para obtener la mayor evidencia de lo que más pesa en la nota:

- **Actas y veedor:** 4,2 puntos.
- **Acceso y roles:** 2,2 puntos.
- **Seguridad:** 1,8 puntos.

El resto se cubre con una prueba manual reproducible. Además, la app debe fallar de forma controlada y con mensajes útiles.

## Alternativas consideradas

| Criterio | **A. Pirámide reducida: unitarias del dominio + pruebas de reglas con el emulador + lista manual en un dispositivo** | B. Unitarias de componentes con TestBed para todas las páginas | C. E2E automatizadas (Cypress/Playwright en el navegador o Appium en Android) |
|---|---|---|---|
| Evidencia para R8 | **Directa** (prueba de reglas). | Ninguna (los componentes no aplican la seguridad). | Indirecta. |
| Esfuerzo | Bajo/medio. | Alto (simular Ionic y Firebase). | Alto (configuración y pruebas frágiles). |
| Velocidad | Segundos. | Media. | Lenta. |
| Cubre el hardware (cámara, GPS) | Solo la manual. | No. | Parcial (Appium). |

## Decisión

### Nivel 1: dominio (unitarias, runner por defecto de la versión de Angular CLI usada)

- `domain/rules/cedula.spec.ts`, `acta-consistency.spec.ts`, `mesa-status.spec.ts`.
- `device/image-quality.util.spec.ts`.
- `core/errors/firebase-error.mapper.spec.ts`.
- **Objetivo:** cada regla de negocio con casos válidos, inválidos y límite.

### Nivel 2: seguridad (emulador)

- `firebase/test/rules.spec.ts` con `@firebase/rules-unit-testing`: la matriz de ADR-008, en la que cada rol intenta cada operación
  y se comprueba `assertSucceeds`/`assertFails`.
- `functions/test/accounts.spec.ts`: permisos de las funciones de cuentas (ADR-007).
- **Comando:** `firebase emulators:exec --only firestore,storage,auth,functions "npm run test:rules"`.
- **La matriz de casos de consistencia se comparte** (un JSON de casos) entre `acta-consistency.spec.ts` y `rules.spec.ts`, así la
  regla del cliente y la del servidor no divergen.

### Nivel 3: lista manual en Android

- `docs/pruebas-manuales.md`, ejecutada sobre el APK final en un dispositivo físico. Cada caso indica: pasos, resultado esperado y
  resultado obtenido, con fecha y captura.
- **Casos mínimos:**
  1. Login con cédula.
  2. Cambio obligatorio de contraseña.
  3. Recuperación por correo.
  4. Crear un coordinador y un veedor; llega el correo.
  5. Asignar y reasignar un veedor.
  6. Registrar un acta consistente / inconsistente / observada.
  7. Foto borrosa rechazada.
  8. Permisos de cámara y GPS denegados.
  9. Veedor intenta abrir una mesa ajena.
  10. Dashboard actualizado.
  11. Modo avión (si se implementa R10).

### Gestión de errores

- `GlobalErrorHandler` + `firebase-error.mapper.ts` (ADR-005): ningún error llega al usuario como código técnico; todos tienen un
  mensaje en español y, si aplica, «Reintentar».
- Los servicios devuelven resultados tipados (`Estado<T>`) y las páginas no tienen `try/catch` sueltos.

### Monitoreo

- Sin servicio externo en la entrega:
  - `console.error` estructurado (visible en Logcat / Chrome DevTools remoto con `chrome://inspect`);
  - registros de Cloud Functions (`firebase functions:log`).
- Firebase Crashlytics queda **descartado por tiempo**: requiere un plugin nativo y su configuración. Se menciona como trabajo futuro.

## Consecuencias

- **Beneficios:**
  - La evidencia de R8 es una prueba automática que se ejecuta en vivo en la defensa.
  - Las reglas de negocio están probadas en ambos lados.
  - La lista manual queda como evidencia del funcionamiento en Android.
- **Obligaciones:**
  - Java instalado (lo exige el emulador de Firestore) y Firebase CLI.
  - Mantener actualizada `pruebas-manuales.md` con el APK final.
- **Limitaciones:** las páginas no tienen pruebas automáticas; la UI se valida a mano.
- **Riesgo:** las pruebas de reglas pasan en el emulador, pero las reglas desplegadas son otra versión. **Mitigación:**
  - desplegar siempre con `firebase deploy --only firestore:rules,storage` **después** de que pasen las pruebas;
  - anotar en el README el hash del commit de las reglas desplegadas.

## Verificación

- `npm test` y `npm run test:rules` en verde (capturas en `docs/evidencias/`).
- `docs/pruebas-manuales.md` completo, con fecha y modelo del dispositivo.
- README con la sección «Pruebas» y los comandos.

## Uso de IA

- **Herramienta:** Claude (Anthropic).
- **Consulta:** estrategia de pruebas viable en 4 días para una app Ionic + Firebase evaluada por seguridad y roles.
- **Respuesta sugerida:** la pirámide reducida de este documento.
- **Aceptación / rechazo:** se aceptó la estrategia de tres niveles. Tras la deliberación se orienta al
  backend aceptado: las pruebas de reglas se hacen contra RLS de Supabase en lugar del emulador de Firebase, y el nivel 3 son las
  pruebas manuales sobre el APK final.
- **Verificación humana:** se ejecutará la lista de pruebas manuales sobre el APK instalado en un
  dispositivo físico, registrando fecha, dispositivo y evidencias.

## Trazabilidad

- Commit del ADR: [enlace]
- Commit de implementación: [enlace]

## Consenso del equipo

| Integrante | Postura y argumentos | Objeciones |
|---|---|---|
| Josué Ortiz | Pruebas en tres niveles; propuso que el nivel 3 sean pruebas manuales sobre el APK final. | — |
| Eduardo Ganchala | Pruebas por capas, gestión centralizada de errores y monitoreo ligero. Estuvo de acuerdo con las pruebas de nivel 3 sobre el APK. | Ninguna |

**Desacuerdo relevante:** qué es lo mínimo que hay que probar sí o sí.

**Acuerdo final:** pruebas en tres niveles orientadas al backend aceptado (Supabase), con el nivel 3 como pruebas manuales sobre
el APK final. ·
**Minuto del video:** [mm:ss–mm:ss]
