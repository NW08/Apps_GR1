# ADR-006 (opcional, R10): Persistir los datos con la caché local de Firestore, guardar las fotos en una cola propia y resolver los conflictos con versión y última escritura revisable

| Campo | Valor |
|---|---|
| **Estado** | Rechazado: la caché de Firestore no aplica al no usar Firebase (ADR-002). El equipo adoptó Dexie (IndexedDB) y `@capacitor/filesystem` (decisión final ADR-006, propuesta de Eduardo Ganchala) |
| **Fecha** | 2026-11-23 |
| **Autor(es) y equipo** | Josué Ortiz · Equipo 6: Eduardo Ganchala, Josué Ortiz |
| **Requisitos relacionados** | R10 (persistencia local y sincronización automática de pendientes al recuperar la conexión, con estrategia de conflictos documentada), R6/R7 (el acta y su foto deben llegar aunque el recinto no tenga cobertura), R8 (las reglas se aplican igual al sincronizar). |

## Contexto

Los recintos electorales (escuelas, coliseos) suelen tener mala cobertura y el escrutinio coincide con picos de uso de la red. El
veedor debe poder registrar el acta y su foto **sin conexión**, y la app debe enviarlas sola al recuperarla.

- **Firestore:** con la caché persistente, encola las escrituras de documentos y las envía al reconectar.
- **Cloud Storage:** **no encola las subidas**; una subida sin conexión falla.
- **Conflictos:** pueden aparecer cuando el veedor corrige sin conexión mientras el coordinador corrige la misma acta en línea.

## Alternativas consideradas

| Criterio | **A. Caché persistente de Firestore + cola propia solo para fotos** | B. Cola propia para todo (SQLite / Preferences) con sincronización manual | C. Sin offline (solo mensaje de error) |
|---|---|---|---|
| Esfuerzo | Medio: Firestore resuelve los datos y solo se programa la cola de fotos. | Alto: hay que serializar, reintentar y reconciliar todo. | Nulo. |
| Fiabilidad de los datos | Alta (mecanismo probado del SDK). | Depende de nuestro código. | — |
| Visibilidad de pendientes | `metadata.hasPendingWrites` por documento + estado de la cola. | Total. | — |
| Bonificación R10 | Sí. | Sí. | No. |
| Riesgo | La promesa de `setDoc` no se resuelve sin conexión: la UI no debe quedarse esperándola. | Errores sutiles de reconciliación. | Se pierde la bonificación. |

## Decisión

1. **Datos:** `initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentSingleTabManager() }) })`. Las
   lecturas sirven desde la caché sin conexión y las escrituras se encolan.
   - **La UI no espera la promesa del guardado:** marca el acta como «Pendiente de sincronizar» si `hasPendingWrites` es verdadero y
     como «Sincronizada» cuando el servidor confirma.
2. **Fotos (`OutboxService` en `data/offline/`):**
   - Al aceptar una foto: se guarda el JPEG en `Filesystem` (`Directory.Data`, `outbox/<actaId>-<ts>.jpg`) y un registro en
     `@capacitor/preferences` (`{ actaId, ruta, intentos, creadoEn }`).
   - El acta se guarda con `foto.estado = 'PENDIENTE'` y la ruta local; la miniatura se muestra desde el archivo local.
   - `@capacitor/network` (`networkStatusChange`) + el arranque de la app + un botón «Sincronizar ahora» disparan el vaciado de la
     cola: sube a Storage, actualiza `foto.ruta`/`foto.estado = 'SUBIDA'` en el acta y borra el archivo local.
   - Reintentos con espera exponencial (5 s, 15 s, 60 s, máx. 5 min). Tras 5 fallos por `permission-denied`, el registro pasa a
     «error» visible (p. ej. la mesa se reasignó a otro veedor).
3. **Conflictos:**
   - Cada acta lleva `version` (entero) y `actualizadoPor`/`actualizadoEn` (`serverTimestamp`).
   - **Regla del servidor:** una actualización debe traer `version == anterior + 1` (ADR-008). Una escritura offline que se aplica
     después de otra ya confirmada llega con una versión antigua y **es rechazada**; el SDK la descarta y la app avisa «El acta fue
     modificada por [rol] mientras estaba sin conexión; revise y vuelva a guardar».
   - **Estrategia:** «la primera escritura confirmada gana; la segunda se revisa» (no se sobrescribe en silencio). La versión rechazada
     se conserva en local (`Preferences`, clave `conflictos`) para que el usuario la compare y la vuelva a aplicar a mano.
   - El historial (`actas/{id}/historial`) guarda cada versión confirmada, así el coordinador ve quién cambió qué.
4. **Indicadores de UI:** chip «Sin conexión» en la cabecera, contador «N pendientes» y estado por acta (pendiente / sincronizada / conflicto).

## Consecuencias

- **Beneficios:** el registro nunca se bloquea por falta de cobertura; ningún dato se sobrescribe en silencio.
- **Obligaciones:**
  - No usar `await` sobre las escrituras de Firestore en el flujo de guardado offline.
  - Las pantallas que dependen de agregaciones (dashboard) muestran «Requiere conexión».
- **Limitaciones:**
  - Las agregaciones y las Cloud Functions (crear cuentas) no funcionan sin conexión.
  - La caché persistente es por dispositivo; si el usuario cierra sesión con pendientes, se le avisa y no se le permite salir hasta
    sincronizar o descartar.
- **Riesgo:** las escrituras rechazadas por las reglas al sincronizar se detectan tarde. **Mitigación:** escuchar
  `onSnapshotsInSync` y el error del listener del documento para mostrar el conflicto en cuanto ocurre.

## Verificación

**Prueba manual en Android** (grabada para la defensa):

1. Activar el modo avión.
2. Registrar el acta de alcaldía con foto → la app la muestra como «Pendiente».
3. Cerrar y reabrir la app → el acta sigue ahí.
4. Desactivar el modo avión → en menos de 30 s el acta pasa a «Sincronizada»: aparece en la consola de Firestore y la foto en Storage.

**Prueba de conflicto:**

1. El veedor corrige sin conexión.
2. El coordinador corrige en línea la misma acta.
3. El veedor reconecta → la app muestra el aviso de conflicto y Firestore conserva la versión del coordinador.

**Prueba unitaria** de `OutboxService` con `Filesystem`/`Network` simulados: reintento y borrado tras una subida exitosa.

## Uso de IA

- **Herramienta:** Claude (Anthropic).
- **Consulta:** offline con Firestore y fotos en Capacitor; estrategia de conflictos.
- **Respuesta sugerida:** caché persistente + cola de fotos + control de versión en las reglas.
- **Aceptación / rechazo:** se rechazó. La propuesta se apoya en la caché persistente de Firestore, que
  no aplica al no usar Firebase (ADR-002). Se conserva la idea de controlar los conflictos por versión, que también recoge la
  decisión final.
- **Verificación humana:** no aplica a esta propuesta; la verificación en modo avión se hará sobre la
  decisión final (Dexie) si se implementa R10.

## Trazabilidad

- Commit del ADR: [enlace]
- Commit de implementación: no aplica (propuesta rechazada); si se implementa R10, sigue la decisión final ADR-006.

## Consenso del equipo

| Integrante | Postura y argumentos | Objeciones |
|---|---|---|
| Josué Ortiz | Caché persistente de Firestore para los datos, cola propia de fotos en `Filesystem` y conflictos por versión con última escritura revisable. | La caché de Firestore no aplica al no usar Firebase. |
| Eduardo Ganchala | Persistencia local con Dexie (IndexedDB), cola de pendientes, `@capacitor/filesystem` para las fotos y sincronización con control de versiones. | Ninguna |

**Acuerdo final:** IndexedDB con Dexie para la cola de pendientes y `@capacitor/filesystem` para las fotos, con control de
versiones para los conflictos. R10 es opcional y cada integrante lo implementa si el tiempo lo permite. ·
**Minuto del video:** [mm:ss–mm:ss]
