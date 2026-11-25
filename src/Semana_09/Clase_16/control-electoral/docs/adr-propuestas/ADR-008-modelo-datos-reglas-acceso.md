# ADR-008: Usar colecciones planas en Firestore con ids deterministas, reglas por rol y pertenencia basadas en claims, y siembra de datos iniciales con un script del Admin SDK

| Campo | Valor |
|---|---|
| **Estado** | Rechazado: el modelo documental de Firestore y sus Security Rules no aplican al usar Supabase (ADR-002). El equipo adoptó el modelo relacional normalizado con RLS y Storage privado de Eduardo Ganchala (decisión final ADR-008) |
| **Fecha** | 2026-11-23 |
| **Autor(es) y equipo** | Josué Ortiz · Equipo 6: Eduardo Ganchala, Josué Ortiz |
| **Requisitos relacionados** | R1 (datos iniciales), R4 (recintos, coordinadores, avance, GPS), R5 (mesas, veedores, asignación, corrección), R6 (actas y consistencia), R7 (foto y GPS como campos), R8 (**demostrar que un veedor no accede a mesas ajenas**; persistencia de datos e imágenes). |

## Contexto

Las entidades son: recinto (cantón, parroquia, nombre, número de JRV), mesa/JRV, acta (una por dignidad y mesa), usuario,
organización y candidatura. Hay que decidir:

- **la forma de las colecciones**, de modo que las reglas puedan comprobar la pertenencia **sin consultas costosas** y las consultas de
  cada rol sean **demostrables por las reglas** (Firestore rechaza una consulta si las reglas no pueden garantizar que todos sus
  resultados están permitidos);
- **dónde guardar las fotos**;
- **cómo cargar los datos iniciales** (R1).

## Alternativas consideradas

| Criterio | **A. Colecciones planas (`recintos`, `mesas`, `actas`, `usuarios`) con `recintoId` desnormalizado** | B. Subcolecciones anidadas (`recintos/{r}/mesas/{m}/actas/{a}`) |
|---|---|---|
| Consultas del provincial (todas las actas) | Una consulta sobre `actas`. | Requiere `collectionGroup` y reglas de grupo. |
| Reglas de pertenencia | `resource.data.recintoId == token.recintoId` (sin `get()`). | La ruta aporta el recinto (cómodo), pero el veedor sigue necesitando `get()` de la mesa. |
| Agregaciones del dashboard | `sum`/`count` sobre `actas` filtrando por `recintoId` y `dignidad`. | Sobre el `collectionGroup`. |
| Riesgo | Mantener el `recintoId` coherente (inmutable tras la creación). | Rutas largas y reglas duplicadas para grupo y ruta. |

**Datos iniciales:** script con el Admin SDK y JSON versionado (**elegido**: repetible y valida contra el emulador) frente a carga manual
en la consola (no repetible ni revisable) o una pantalla de importación en la app (exige privilegios en el cliente).

**Fotos:** Cloud Storage con la ruta guardada en el acta (**elegido**) frente a la imagen en Base64 dentro del documento (límite de
1 MiB por documento, lecturas caras).

## Decisión

### Colecciones

| Colección / id | Campos | Quién escribe |
|---|---|---|
| `organizaciones/{o1…o5}` | `nombre`, `siglas`, `lista`, `orden` | Siembra |
| `candidaturas/{id}` | `dignidad` (`ALCALDIA`/`PREFECTURA`), `organizacionId`, `nombre` | Siembra |
| `recintos/{recintoId}` | `provincia`, `canton`, `parroquia`, `nombre`, `numJrv`, `coordinadorUid?`, `creadoEn` | Siembra; el provincial crea recintos nuevos; Functions asigna el coordinador |
| `mesas/{recintoId}-{NNN}` | `recintoId`, `numero`, `veedorUid?` | Provincial (al crear el recinto, en un *batch* con sus `numJrv` mesas); el coordinador cambia solo `veedorUid` |
| `actas/{mesaId}_{ALCALDIA\|PREFECTURA}` | `mesaId`, `recintoId`, `dignidad`, `votos {o1…o5}`, `nulos`, `blancos`, `totalSufragantes`, `estado` (`REGISTRADA`/`CORREGIDA`/`OBSERVADA`), `observacion?`, `foto {ruta, estado}`, `gps {lat, lng, precisionM, capturadoEn}`, `version`, `registradoPor`, `actualizadoPor`, `actualizadoEn` | El veedor asignado; el coordinador del recinto (correcciones) |
| `actas/{id}/historial/{auto}` | Copia de la versión anterior + quién y cuándo | Quien corrige (solo creación) |
| `usuarios/{uid}` | `cedula`, `nombres`, `apellidos`, `telefono`, `correo`, `rol`, `recintoId?`, `creadoPor`, `activo` | **Solo Functions** |
| `cedulas/{cedula}` | `uid` | **Solo Functions** (unicidad) |

- **Ids deterministas:** un acta por mesa y dignidad, sin duplicados. El veedor lee su acta con un `get` directo, sin necesidad de
  consultas de lista.
- **Estado de la mesa:** se **deriva** de sus actas (sin veedor / sin actas / 1 de 2 / completa / con observación) en la capa de
  dominio (`mesa-status.ts`). No se guarda, así no puede quedar desincronizado.
- **Fotos:** `actas/{recintoId}/{mesaId}/{dignidad}_{timestamp}.jpg`. No se sobrescriben: cada corrección añade un archivo y
  `foto.ruta` apunta al último.
- **Índices compuestos** en `firestore.indexes.json`: `actas(recintoId, dignidad)`, `mesas(recintoId, numero)`, `usuarios(recintoId, rol)`.

### Reglas de Firestore (extracto; el archivo completo va en `firebase/firestore.rules`)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {
    function ready()      { return request.auth != null && request.auth.token.debeCambiarClave == false; }
    function rol()        { return request.auth.token.rol; }
    function isProv()     { return ready() && rol() == 'PROVINCIAL'; }
    function isRec(r)     { return ready() && rol() == 'RECINTO' && request.auth.token.recintoId == r; }
    function mesa(m)      { return get(/databases/$(db)/documents/mesas/$(m)).data; }
    function isVeedorDe(m){ return ready() && rol() == 'VEEDOR' && mesa(m).veedorUid == request.auth.uid; }
    function consistente(x) {
      return x.votos.keys().hasOnly(['o1','o2','o3','o4','o5']) && x.votos.keys().hasAll(['o1','o2','o3','o4','o5'])
        && x.votos.o1 is int && x.votos.o1 >= 0 && x.votos.o2 is int && x.votos.o2 >= 0
        && x.votos.o3 is int && x.votos.o3 >= 0 && x.votos.o4 is int && x.votos.o4 >= 0
        && x.votos.o5 is int && x.votos.o5 >= 0
        && x.nulos is int && x.nulos >= 0 && x.blancos is int && x.blancos >= 0 && x.totalSufragantes is int
        && ( x.votos.o1 + x.votos.o2 + x.votos.o3 + x.votos.o4 + x.votos.o5 + x.nulos + x.blancos == x.totalSufragantes
             || (x.estado == 'OBSERVADA' && x.observacion is string && x.observacion.size() >= 10) );
    }

    match /organizaciones/{id} { allow read: if ready(); allow write: if false; }
    match /candidaturas/{id}   { allow read: if ready(); allow write: if false; }
    match /usuarios/{uid} {
      allow get:  if ready() && (uid == request.auth.uid || isProv() || isRec(resource.data.recintoId));
      allow list: if isProv() || isRec(resource.data.recintoId);
      allow write: if false;                       // solo Cloud Functions (Admin SDK)
    }
    match /cedulas/{c} { allow read, write: if false; }

    match /recintos/{r} {
      allow read:   if isProv() || isRec(r) || (ready() && rol() == 'VEEDOR' && request.auth.token.recintoId == r);
      allow create: if isProv() && request.resource.data.coordinadorUid == null;
      allow update: if isProv() && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['nombre', 'parroquia']);
    }

    match /mesas/{m} {
      allow read:   if isProv() || isRec(resource.data.recintoId)
                    || (ready() && rol() == 'VEEDOR' && resource.data.veedorUid == request.auth.uid);
      allow create: if isProv() && request.resource.data.veedorUid == null;
      allow update: if isRec(resource.data.recintoId)
                    && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['veedorUid'])
                    && (request.resource.data.veedorUid == null
                        || (get(/databases/$(db)/documents/usuarios/$(request.resource.data.veedorUid)).data.rol == 'VEEDOR'
                            && get(/databases/$(db)/documents/usuarios/$(request.resource.data.veedorUid)).data.recintoId
                               == resource.data.recintoId));
    }

    match /actas/{a} {
      // El veedor hace get directo, incluso de un acta que aún no existe (resource == null): la mesa sale del id.
      allow get:    if isProv() || (resource != null && isRec(resource.data.recintoId)) || isVeedorDe(a.split('_')[0]);
      allow list:   if isProv() || isRec(resource.data.recintoId);
      allow create: if isVeedorDe(request.resource.data.mesaId)
                    && a == request.resource.data.mesaId + '_' + request.resource.data.dignidad
                    && request.resource.data.dignidad in ['ALCALDIA', 'PREFECTURA']
                    && request.resource.data.recintoId == mesa(request.resource.data.mesaId).recintoId
                    && request.resource.data.version == 1
                    && request.resource.data.gps.lat is number && request.resource.data.gps.lng is number
                    && consistente(request.resource.data);
      allow update: if (isVeedorDe(resource.data.mesaId) || isRec(resource.data.recintoId))
                    && request.resource.data.diff(resource.data).affectedKeys()
                         .hasOnly(['votos','nulos','blancos','totalSufragantes','estado','observacion','foto','gps',
                                   'version','actualizadoPor','actualizadoEn'])
                    && request.resource.data.version == resource.data.version + 1     // control de conflictos (ADR-006)
                    && consistente(request.resource.data);
      allow delete: if false;
      match /historial/{h} {
        allow read:   if isProv() || isRec(get(/databases/$(db)/documents/actas/$(a)).data.recintoId) || isVeedorDe(a.split('_')[0]);
        allow create: if isRec(get(/databases/$(db)/documents/actas/$(a)).data.recintoId) || isVeedorDe(a.split('_')[0]);
        allow update, delete: if false;
      }
    }
  }
}
```

### Reglas de Storage (extracto, `firebase/storage.rules`)

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /actas/{recintoId}/{mesaId}/{archivo} {
      function ready()  { return request.auth != null && request.auth.token.debeCambiarClave == false; }
      function mesa()   { return firestore.get(/databases/(default)/documents/mesas/$(mesaId)).data; }
      function veedor() { return ready() && request.auth.token.rol == 'VEEDOR'
                                 && mesa().veedorUid == request.auth.uid && mesa().recintoId == recintoId; }
      function rec()    { return ready() && request.auth.token.rol == 'RECINTO' && request.auth.token.recintoId == recintoId; }
      function prov()   { return ready() && request.auth.token.rol == 'PROVINCIAL'; }
      allow read:   if prov() || rec() || veedor();
      allow create: if (veedor() || rec()) && request.resource.contentType == 'image/jpeg'
                    && request.resource.size < 3 * 1024 * 1024;
      allow update, delete: if false;
    }
  }
}
```

### Datos iniciales (R1)

- `seed/datos-iniciales.json` (versionado), con:
  - la provincia y el cantón elegidos: **[definir; p. ej. Pichincha – Rumiñahui]**;
  - sus recintos (cantón, parroquia, nombre, `numJrv`);
  - **cinco organizaciones ficticias** con sus candidaturas a alcaldía y prefectura (nombres inventados, para no usar partidos reales).
- `scripts/seed.ts` (Admin SDK, se ejecuta en local):
  - contra el emulador por defecto, o contra producción con `GOOGLE_APPLICATION_CREDENTIALS` apuntando a una cuenta de servicio
    **fuera del repositorio**;
  - es idempotente (`set` con ids fijos);
  - crea las mesas de cada recinto y la cuenta provincial de demostración.

## Consecuencias

- **Beneficios:**
  - Las consultas de cada rol son demostrables por las reglas.
  - La pertenencia del coordinador se comprueba sin `get()` (más barato).
  - La consistencia y el control de versión se aplican **en el servidor**.
  - Las fotos tienen historial.
- **Obligaciones:**
  - El `recintoId` y el `mesaId` de un acta son inmutables (garantizado por `affectedKeys`).
  - Toda corrección escribe el historial y la nueva versión en el mismo *batch*.
- **Limitaciones:**
  - Cada evaluación de `isVeedorDe` cuesta una lectura (`get` de la mesa).
  - Las organizaciones son exactamente 5 (`o1…o5`), fijas por R1.
- **Riesgos:**
  - **Reasignación de veedor:** el veedor anterior pierde el acceso al instante (correcto), pero si tenía escrituras offline pendientes
    serán rechazadas; ADR-006 lo muestra como conflicto.
  - **Reglas complejas:** una regla mal escrita podría abrir el acceso. **Mitigación:** pruebas de reglas obligatorias (ADR-010).

## Verificación

**Pruebas de reglas** con `@firebase/rules-unit-testing` y el emulador (`firebase/test/rules.spec.ts`) — **evidencia de R8**:

- **Veedor A, asignado a la mesa M1:**
  - `get` de `actas/M2_ALCALDIA` (mesa del veedor B) → **denegado**;
  - `get` de la foto en `actas/R1/M2/...` → **denegado**;
  - `list` de todas las `mesas` → **denegado**;
  - `list` de `mesas where veedorUid == A` → permitido.
- **Coordinador de R1:**
  - actualiza una mesa de R2 → denegado;
  - asigna como veedor a un usuario de otro recinto → denegado.
- **Actas:**
  - acta inconsistente sin `OBSERVADA` → denegada;
  - acta con `version` no incrementada → denegada.
- **Usuario con `debeCambiarClave`:** cualquier lectura → denegada.

**Siembra:** `npm run seed` contra el emulador deja N recintos, Σ`numJrv` mesas, 5 organizaciones y 10 candidaturas (comprobado en la
interfaz del emulador).

**Demostración en vivo en la defensa:** con la sesión de un veedor, intentar abrir la mesa de otro → error «No tiene permiso».

## Uso de IA

- **Herramienta:** Claude (Anthropic).
- **Consulta:** modelo de Firestore y reglas por rol y pertenencia para el escrutinio.
- **Respuesta sugerida:** colecciones planas, ids deterministas, claims y las reglas de este documento.
- **Aceptación / rechazo:** se rechazó. El modelo de colecciones de Firestore, los *claims* y las
  Security Rules dependen de Firebase, descartado en ADR-002. Se conserva la matriz de permisos por rol y pertenencia (un veedor no
  accede a mesas ajenas), que la decisión final implementa con RLS.
- **Verificación humana:** no aplica a esta propuesta; la prueba «veedor A no puede leer la mesa ni la
  foto del veedor B» se hace contra las políticas RLS de la decisión final.

## Trazabilidad

- Commit del ADR: [7bcce3d](https://github.com/NW08/Apps_GR1/commit/7bcce3d)
- Commit de implementación: no aplica (propuesta rechazada); la implementación sigue la decisión final ADR-008 (Supabase).

## Consenso del equipo

| Integrante | Postura y argumentos | Objeciones |
|---|---|---|
| Josué Ortiz | Reglas de acceso por rol y pertenencia. Para el estado de las mesas propuso **triggers** que lo recalculan al guardar un acta. | — |
| Eduardo Ganchala | Modelo relacional normalizado (votos en tabla hija), Storage privado para las fotos y políticas RLS por rol. Propuso **vistas** para el estado y las consultas. | — |

**Desacuerdo relevante:** calcular el estado de las mesas y los consolidados con vistas o con triggers.

**Acuerdo final:** esquema normalizado con los votos en una tabla hija y una siembra de datos fijos conocidos (R1). El **estado
de la mesa se guarda** al registrar el acta, en lugar de calcularse en cada consulta, y se usan **vistas para las consultas más
pesadas (dashboard), junto con índices**. ·
**Minuto del video:** 00:47:03–00:58:01 (consenso 00:55:54–00:58:01)
