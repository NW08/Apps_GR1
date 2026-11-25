# ADR-006 (opcional, R10): Persistir los pendientes en IndexedDB con Dexie, las fotos con Filesystem y resolver conflictos por versión

| Campo | Valor |
|---|---|
| **Estado** | Aceptado (componente opcional: cada integrante lo implementa si el tiempo lo permite) |
| **Fecha** | 2026-11-24 |
| **Autor(es) y equipo** | Equipo 6: Eduardo Ganchala, Josué Ortiz |
| **Origen** | Propuesta de Eduardo Ganchala (su ADR-009). Rechaza la propuesta de Josué Ortiz (su ADR-006, caché de Firestore). |
| **Requisitos relacionados** | R10 (persistencia local y sincronización automática con estrategia de conflictos), R6/R7 (el acta y su foto deben llegar aunque el recinto no tenga cobertura), R8 (RLS se aplica igual al sincronizar). |

## Contexto

Los recintos pueden tener cobertura débil. El veedor debe poder capturar el acta, la foto y el GPS sin conexión y enviarlos después,
sin duplicados. Un coordinador puede corregir la misma acta mientras el veedor está sin conexión, lo que genera conflictos. Supabase
no tiene offline nativo (ADR-002) y la bonificación no debe comprometer el flujo en línea.

## Alternativas consideradas

| Criterio | **A. IndexedDB con Dexie + `@capacitor/filesystem`** | B. SQLite (`@capacitor-community/sqlite`) | C. `@capacitor/preferences` | D. Caché persistente de Firestore |
|---|---|---|---|---|
| Ajuste | Cola con índices; funciona en Android y en el navegador. | Robusto y relacional. | Clave-valor trivial. | Cola de escrituras automática. |
| Costo | Una dependencia ligera; fotos aparte. | Plugin nativo, configuración extra, no funciona en navegador sin más. | No sirve para varias actas ni binarios. | **No aplica: el equipo no usa Firebase (ADR-002).** |

## Decisión

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

## Consecuencias

- **Beneficios:** no se pierden actas por falta de red; no hay duplicados.
- **Obligaciones:** la interfaz muestra el estado de cada acta y un contador de pendientes.
- **Riesgos:** pérdida de datos locales si se desinstala la app o el sistema limpia el almacenamiento (se advierte con el contador);
  complejidad añadida, aislada en `SyncService`.

## Verificación

- En modo avión, registrar un acta con foto la deja `pendiente`; al reactivar la red pasa a `sincronizada` sin intervención.
- Enviar dos veces el mismo `client_uuid` produce una sola fila en `actas`.
- Corregir el acta como coordinador mientras el veedor está sin conexión produce `conflicto` al sincronizar.

## Uso de IA

- **Eduardo Ganchala · Gemini:** cola local con reintentos y política determinista de conflictos. Se aceptó parcialmente.
- **Josué Ortiz · Claude (Anthropic):** caché persistente de Firestore + cola de fotos + control de versión. Se rechazó la caché (no
  aplica sin Firebase); se conserva el control por versión.
- **Verificación humana:** prueba en modo avión en un dispositivo físico, si se implementa.

## Trazabilidad

- Propuestas: `adr-edu/ADR-009-offline-cola-sincronizacion.md` (aceptada) · `adr-mio/ADR-006-offline-sincronizacion.md` (rechazada).
- Commit del ADR: [enlace]
- Commit de implementación: [enlace, si se implementa R10]

## Consenso del equipo

| Integrante | Postura y argumentos | Objeciones |
|---|---|---|
| Eduardo Ganchala | Dexie (IndexedDB), cola de pendientes, `Filesystem` para fotos y control de versiones. | Ninguna |
| Josué Ortiz | Caché de Firestore, cola de fotos y conflictos por versión. | La caché de Firestore no aplica al no usar Firebase. |

**Acuerdo final:** IndexedDB con Dexie para la cola y `@capacitor/filesystem` para las fotos, con conflictos por versión. R10 es
opcional e individual. · **Minuto del video:** [mm:ss–mm:ss]
