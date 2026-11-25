# ADR-008: Usar un modelo relacional normalizado con votos en tabla hija, políticas RLS por rol y pertenencia, Storage privado estado de mesa guardado y vistas con índices para las consultas pesadas

| Campo | Valor |
|---|---|
| **Estado** | Aceptado |
| **Fecha** | 2026-11-24 |
| **Autor(es) y equipo** | Equipo 6: Eduardo Ganchala, Josué Ortiz |
| **Origen** | Propuesta de Eduardo Ganchala (su ADR-003), con el acuerdo del debate: estado de mesa guardado y vistas con índices. Rechaza la propuesta de Josué Ortiz (su ADR-008, Firestore y Security Rules). |
| **Requisitos relacionados** | R1 (datos iniciales), R4 (avance, GPS y dashboard), R5/R6 (mesas, asignación y actas), R7 (foto y GPS como campos), R8 (persistencia de datos e imágenes; aislamiento entre veedores). |

## Contexto

Existe una jerarquía provincia → recinto → JRV → acta, con votos por candidatura para alcaldía y prefectura. El dashboard necesita
sumas por candidato, por recinto y consolidadas. Las fotos son evidencia electoral y no deben ser públicas. Un veedor no puede leer ni
escribir mesas ajenas, aunque llame a la API directamente.

## Alternativas consideradas

**Votos**

| Criterio | **A. Tabla hija `acta_votos`** | B. Columnas fijas `votos_org1…5` | C. JSON dentro del acta |
|---|---|---|---|
| Agregación | `GROUP BY` directo. | Requiere *unpivot*. | Ineficiente. |
| Integridad | Claves foráneas y `CHECK`. | `CHECK` por columna. | Ninguna. |
| Escritura | Varias filas: exige transacción (RPC). | Una fila. | Una fila. |

**Estado de las mesas y consolidados**

| Criterio | A. Calcularlo en una vista en cada consulta | **B. Guardarlo en `jrv.estado` y recalcularlo al registrar el acta** |
|---|---|---|
| Consistencia | Siempre derivado de los datos. | Depende de recalcularlo en cada escritura del acta. |
| Lectura | Costo en cada consulta. | Lectura directa de la columna. |

Para los consolidados del dashboard se mantienen las vistas (ADR-009).

**Fotos:** bucket público (simple, URLs abiertas) frente a bucket **privado** con URLs firmadas (acceso por políticas).

## Decisión

**Tablas** (`supabase/migrations`):

- `recintos(id, provincia, canton, parroquia, nombre, num_jrv, lat, lng)`; al crear un recinto se generan sus `num_jrv` mesas.
- `perfiles(id = auth.uid, cedula unique, nombres, apellidos, telefono, email, rol, recinto_id, creado_por, debe_cambiar_clave)`.
- `jrv(id, recinto_id, numero, veedor_id null, estado)`.
- `organizaciones(id, nombre, lista)` · `candidaturas(id, organizacion_id, dignidad: alcalde|prefecto, nombre)`.
- `actas(id, jrv_id, dignidad, nulos, blancos, total_sufragantes, foto_path, lat, lng, precision_m, capturado_en,
  ubicacion_comprobable, estado: VALIDADA|OBSERVADA|CORREGIDA, observacion, version, client_uuid unique, actualizado_por,
  actualizado_en)` con `unique(jrv_id, dignidad)`.
- `acta_votos(acta_id, candidatura_id, votos >= 0)` · `acta_historial(acta_id, version, datos jsonb, cambiado_por, cambiado_en)`.

**Integridad:** `CHECK` de no negativos; la RPC `guardar_acta` inserta o corrige el acta y sus votos en una transacción, sube la
`version` y guarda la anterior en `acta_historial`. Un trigger rechaza el acta si `Σ votos + nulos + blancos ≠ total_sufragantes`,
salvo que esté `OBSERVADA` con observación (ADR-005).

**Estado de la mesa, vistas e índices** (acuerdo del debate): el estado de cada mesa (`PENDIENTE`, `PARCIAL`, `COMPLETA`,
`OBSERVADA`) **se guarda en `jrv.estado`** y lo recalcula un trigger cada vez que se inserta o corrige un acta; las consultas pesadas
del dashboard son vistas con `security_invoker = true` (ADR-009). Índices en
`jrv(recinto_id)`, `jrv(veedor_id)`, `actas(jrv_id)`, `acta_votos(acta_id)` y `perfiles(recinto_id)`.

**Políticas RLS** (todas exigen además `debe_cambiar_clave = false`, ADR-007):

- **Provincial:** lee todo; crea y edita recintos; lee perfiles.
- **Recinto:** lee y escribe solo filas con `recinto_id = auth_recinto_id()`: asigna veedores a sus JRV y corrige actas y fotos.
- **Veedor:** lee y escribe solo `jrv` y `actas` con `jrv.veedor_id = auth.uid()`.
- **Storage:** bucket privado `actas`, ruta `{recinto_id}/{jrv_id}/{dignidad}.jpg`; la política compara los segmentos con la
  pertenencia del usuario; acceso con URL firmada de corta duración.

**Siembra (R1):** `supabase/seed.sql` con Pichincha / Quito: recintos con cantón, parroquia, nombre y número de JRV; cinco
organizaciones ficticias; cinco candidaturas a la alcaldía y cinco a la prefectura.

## Consecuencias

- **Beneficios:** agregados con SQL; integridad en la base de datos; fotos privadas; estado de mesa siempre coherente.
- **Obligaciones:** versionar migraciones y siembra; probar las políticas por rol (ADR-010).
- **Riesgo:** una política mal escrita abre datos ajenos o bloquea a usuarios legítimos. **Mitigación:** prueba de RLS por rol antes
  de generar el APK.

## Verificación

- Como veedor A: leer la JRV o el acta de una mesa del veedor B devuelve 0 filas; insertar un acta en ella falla.
- Como coordinador del recinto X: no lee mesas del recinto Y.
- Insertar un acta con totales incoherentes y sin `OBSERVADA` devuelve el error del trigger.
- Pedir la foto sin sesión devuelve 400/403.
- `select count(*) from recintos` coincide con la siembra.

## Uso de IA

- **Eduardo Ganchala · Gemini:** esquema normalizado y políticas RLS diferenciadas por rol. Se aceptó parcialmente.
- **Josué Ortiz · Claude (Anthropic):** modelo de Firestore y Security Rules. Se rechazó por depender de Firebase; se conserva la
  matriz de permisos por rol y pertenencia.
- **Verificación humana:** el SQL de referencia del equipo se usa como guía y cada integrante escribe y prueba sus migraciones.

## Trazabilidad

- Propuestas: `adr-edu/ADR-003-modelo-datos-storage-rls.md` (aceptada) · `adr-mio/ADR-008-modelo-datos-reglas-acceso.md` (rechazada).
- Commit del ADR: [enlace]
- Commit de implementación: [enlace: `supabase/migrations`, `supabase/seed.sql`]

## Consenso del equipo

| Integrante | Postura y argumentos | Objeciones |
|---|---|---|
| Eduardo Ganchala | Modelo normalizado con votos en tabla hija, Storage privado y RLS por rol. Propuso **vistas**. | — |
| Josué Ortiz | Reglas por rol y pertenencia. Propuso **triggers** para mantener el estado de las mesas. | — |

**Desacuerdo relevante:** calcular el estado de las mesas y los consolidados con vistas o con triggers.

**Acuerdo final:** esquema normalizado con votos en tabla hija y siembra de datos fijos conocidos; el **estado de la mesa se guarda**
al registrar el acta y se usan **vistas para las consultas más pesadas, junto con índices**. · **Minuto del video:** 00:47:03–00:58:01 (consenso 00:55:54–00:58:01)
