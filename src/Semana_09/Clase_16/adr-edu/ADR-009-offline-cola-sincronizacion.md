# ADR-009: Se adoptó la persistencia local con Dexie, una cola de pendientes y la sincronización con control de versiones

## Estado
Aceptado

## Fecha
2026-11-22

## Autor(es) y equipo
[Eduardo Ganchala] · Equipo [6]
## Requisitos relacionados
- R10: persistencia local, sincronización automática al recuperar la conexión y estrategia de conflictos documentada.
- R6 / R7: registro de actas con foto y GPS.

## Contexto
Los recintos pudieron tener cobertura débil. El veedor debió poder capturar el acta, la foto y el GPS sin conexión y que se enviaran luego, sin duplicados. Un coordinador de recinto pudo corregir la misma acta mientras el veedor estaba sin conexión, lo que generó conflictos. La bonificación no sustituyó los requisitos obligatorios, por lo que no debió comprometer el flujo en línea.

## Alternativas consideradas
**A. IndexedDB con Dexie para la cola y `@capacitor/filesystem` para las fotos**
- Ventajas: la API fue simple, permitió consultas por índice, no requirió un plugin nativo de SQL y funcionó también al probar en navegador.
- Desventajas: el sistema pudo eliminar IndexedDB ante falta extrema de almacenamiento, y las fotos requirieron un manejo aparte.

**B. SQLite (`@capacitor-community/sqlite`)**
- Ventajas: fue más robusto y relacional.
- Desventajas: requirió un plugin nativo adicional, no funcionó en navegador sin configuración extra y demandó más tiempo de integración.

**C. `@capacitor/preferences` (clave-valor)**
- Ventajas: fue trivial.
- Desventajas: no sirvió para colas con varios registros ni para binarios.

## Decisión
Se eligió la alternativa **A**.
- Cada acta se creó con un `client_uuid` generado en el dispositivo (clave de idempotencia) y un estado local `pendiente | sincronizando | sincronizada | conflicto | error`.
- La foto se guardó con `Filesystem` y la cola almacenó su ruta; al sincronizar se subió primero la foto y luego se llamó a la RPC `guardar_acta`.
- Disparadores de sincronización: el evento de `@capacitor/network` al volver la conexión, la apertura de la app y un botón manual.
- Se aplicaron reintentos con espera exponencial; los errores de validación (4xx) no se reintentaron y pasaron a `error` con un mensaje.
- **Conflictos:** cada acta tuvo `version`. El cliente envió la `version_base` que conocía. Si la versión del servidor era mayor (alguien más la había modificado), la RPC no sobrescribió y devolvió `conflicto`. Se estableció la regla de que prevaleció la corrección del coordinador de recinto; para el veedor se mostró una pantalla con ambas versiones para elegir cuál conservar. La sincronización repetida del mismo `client_uuid` fue idempotente.

## Consecuencias
- Beneficios: no se perdieron actas por falta de red y no hubo duplicados.
- Obligaciones: la interfaz mostró el estado de cada acta (pendiente, sincronizada, conflicto).
- Riesgos: (1) hubo posibilidad de pérdida de datos locales si se desinstalaba la app o el sistema limpiaba el almacenamiento; se advirtió al usuario con el contador de pendientes. (2) Se añadió complejidad, que se aisló en `SyncService`, de modo que la ruta en línea funcionó sin él.

## Verificación
- Se definió, en modo avión: registrar un acta con foto debía dejarla `pendiente`; al reactivar la red debía pasar a `sincronizada` sin intervención.
- Se definió que enviar dos veces el mismo `client_uuid` debía producir una sola fila en `actas`.
- Se definió que modificar el acta desde la cuenta del coordinador mientras el veedor estaba sin conexión debía producir el estado `conflicto` al sincronizar.
- Se establecieron pruebas unitarias de `SyncService` con un repositorio simulado.

## Uso de IA
- Herramienta: [Gemini IA]. Se consultaron estrategias de sincronización y resolución de conflictos.
- Respuesta sugerida: la herramienta recomienda implementar una cola local de sincronización con reintentos automáticos al recuperar la conectividad y una política determinista de resolución de conflictos.
- Aceptación/Rechazo: Aceptado parcialmente. El equipo implementará la cola local de sincronización con RxJS y aplicará una política simple de resolución de conflictos acorde al alcance del proyecto. 
- Verificación humana: el equipo realizará pruebas desconectando la red para verificar el encolado local, el envío automático al reconectar y la prevención de registros duplicados.
## Trazabilidad
- Commit del ADR: git commit -m "docs(adr): propuestas ADR-001 a ADR-010"
- Commit de implementación: Pendiente

## Consenso del equipo
Pendiente