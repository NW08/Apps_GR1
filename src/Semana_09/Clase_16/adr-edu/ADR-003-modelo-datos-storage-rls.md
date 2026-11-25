# ADR-003: Se adoptó un modelo relacional normalizado, almacenamiento privado de fotos y políticas RLS (Seguridad a nivel de fila) por rol

## Estado
Aceptado

## Fecha
2026-11-22

## Autor(es) y equipo
[Eduardo Ganchala] · Equipo [6]
## Requisitos relacionados
- R1: datos iniciales (recintos, organizaciones, candidaturas).
- R4: avance de actas, GPS y dashboard.
- R5 / R6: mesas, asignación y registro de actas.
- R7: foto y GPS como campos del registro.
- R8: persistencia de datos e imágenes y aislamiento entre veedores.

## Contexto
Existió una jerarquía provincial → recinto → JRV → acta, con votos por candidatura. El dashboard necesitó sumas por candidato y por recinto o consolidado. Las fotos de actas fueron datos electorales sensibles y no debían ser públicas. Los criterios fueron la integridad de totales, las consultas de agregación sencillas y la privacidad de las imágenes.

## Alternativas consideradas
**A. Esquema normalizado con votos en tabla hija (`acta_votos`)**
- Ventajas: las agregaciones se resolvieron con `GROUP BY`; agregar candidaturas no cambió el esquema; se contó con restricciones de integridad.
- Desventajas: un registro de acta implicó varias filas, lo que exigió una transacción.

**B. Una fila por acta con columnas fijas por organización (`votos_org1…votos_org5`)**
- Ventajas: la inserción fue simple.
- Desventajas: resultó rígida; el dashboard requirió `UNPIVOT`; las columnas no distinguieron alcalde de prefecto sin duplicar tablas.

**C. Votos como JSON dentro del acta**
- Ventajas: fue flexible y simple para offline.
- Desventajas: careció de integridad referencial y de agregación eficiente.

**Almacenamiento de fotos:** se comparó un bucket **público** (URL abiertas, simple) frente a un bucket **privado** con URLs firmadas (acceso controlado por políticas). Se eligió el privado.

## Decisión
Se eligió la alternativa **A** con bucket privado.

Tablas principales:
- `recintos(id, canton, parroquia, nombre, num_jrv, lat, lng)`
- `jrv(id, recinto_id, numero, veedor_id null, estado)`
- `organizaciones(id, nombre)` · `candidaturas(id, organizacion_id, dignidad: alcalde|prefecto, nombre)`
- `perfiles(id = auth.uid, cedula unique, nombres, apellidos, telefono, email, rol, recinto_id, creado_por, debe_cambiar_clave)`
- `actas(id, jrv_id, dignidad, nulos, blancos, total_sufragantes, foto_path, lat, lng, precision_m, version, client_uuid unique, estado, actualizado_por, actualizado_en)` con `unique(jrv_id, dignidad)`
- `acta_votos(acta_id, candidatura_id, votos >= 0)`

Integridad: se definieron `CHECK` de valores no negativos y un trigger que rechazó un acta cuando `sum(votos) + nulos + blancos <> total_sufragantes`, como segunda barrera además de la validación de la app. El registro del acta y sus votos se hizo con la RPC `guardar_acta` en una sola transacción.

Políticas RLS:
- Provincial: lectura de todo; escritura en `recintos` y `perfiles` de su alcance.
- Recinto: lectura y escritura solo en filas con `recinto_id = auth_recinto_id()`.
- Veedor: lectura y escritura únicamente de `jrv` y `actas` con `jrv.veedor_id = auth.uid()`.
- Storage bucket `actas`, con ruta `{recinto_id}/{jrv_id}/{dignidad}.jpg`; la política comparó el primer y el segundo segmento con la pertenencia del usuario. El acceso se hizo con URL firmada de corta duración.
- Dashboard: se creó la vista `resultados_por_candidato_recinto` con `security_invoker`, de modo que RLS se aplicó al consultante y solo el provincial vio el consolidado.

## Consecuencias
- Beneficios: los agregados se obtuvieron con SQL, la integridad quedó en la base de datos y las fotos permanecieron privadas.
- Obligaciones: se debieron versionar las migraciones y semillas (`supabase/migrations`, `seed.sql`) con los datos de R1.
- Riesgo: una política mal escrita pudo abrir datos ajenos o bloquear a usuarios legítimos. Se mitigó con pruebas SQL por rol.

## Verificación
- Se estableció `supabase/tests/rls.sql`: el veedor A no leyó actas, votos ni fotos de la mesa de B, y el recinto X no leyó el recinto Y.
- Se definió que intentar insertar un acta con totales incoherentes debía devolver el error del trigger.
- Se definió que pedir directamente la URL de una foto sin sesión debía devolver 400/403.
- Se definió que `select count(*) from recintos` debía coincidir con los datos precargados.

## Uso de IA
- Herramienta: [Gemini IA]. Se consultó el diseño del esquema y de las políticas RLS por rol.
- Respuesta sugerida: la herramienta sugiere estructurar un esquema relacional normalizado con políticas RLS diferenciadas (`SELECT`, `INSERT`, `UPDATE`) según el rol y la pertenencia del registro. 
- Aceptación/Rechazo: Aceptado parcialmente. El equipo tomará como base el esquema relacional y la estructura de políticas RLS, y ajustará tablas, columnas y restricciones a los requisitos exactos del proyecto. 
- Verificación humana: el equipo revisará la sintaxis SQL de las migraciones y ejecutará pruebas con usuarios de cada rol en `supabase/tests` para confirmar que RLS bloqueará accesos no autorizados.

## Trazabilidad
- Commit del ADR: git commit -m "docs(adr): propuestas ADR-001 a ADR-010"
- Commit de implementación: Pendiente

## Consenso del equipo
Pendiente 
