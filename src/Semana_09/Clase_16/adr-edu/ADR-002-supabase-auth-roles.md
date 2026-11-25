# ADR-002: Se eligió Supabase como backend, con autenticación por cédula y autorización por rol

## Estado
Aceptado

## Fecha
2026-11-22

## Autor(es) y equipo
[Eduardo Ganchala] · Equipo [6]
## Requisitos relacionados
- R2: no hubo autorregistro, se definió la jerarquía de creación y la confirmación por correo.
- R3: se requirió login con cédula, contraseña inicial `Ecuador2026`, cambio obligatorio, recuperación por correo y ninguna clave administrativa en la app.
- R8: se exigieron reglas de acceso por rol y pertenencia en el backend.

## Contexto
Los permisos dependieron del rol (provincial, recinto, veedor) y de la pertenencia (recinto y mesas asignadas). Un veedor no debía leer mesas ajenas ni siquiera llamando a la API directamente. La creación de usuarios por otros usuarios exigió privilegios administrativos que no podían estar en la app. Los criterios fueron la expresividad de las reglas de acceso, las consultas relacionales para el dashboard (suma de votos por candidato y recinto), el costo y los límites del plan gratuito, y la disponibilidad de almacenamiento privado.

## Alternativas consideradas
**A. Supabase (Postgres + Auth + Storage + Edge Functions)**
- Ventajas: Row Level Security en SQL expresó "mesas asignadas a mí" con joins; las agregaciones del dashboard se resolvieron con SQL; Storage tuvo políticas sobre el mismo modelo; las Edge Functions permitieron operaciones con `service_role`.
- Desventajas: el plan gratuito pausó proyectos inactivos y limitó almacenamiento y correos; las políticas RLS mal escritas fueron fáciles de equivocar; el SMTP por defecto tuvo un límite muy bajo.

**B. Firebase (Auth + Firestore + Storage)**
- Ventajas: ofreció persistencia offline integrada y un SDK maduro.
- Desventajas: las Security Rules no permitieron joins, por lo que las reglas de pertenencia obligaron a denormalizar o a leer documentos auxiliares con `get()` (costo y complejidad); las agregaciones del dashboard fueron costosas o debieron hacerse en el cliente; el modelo NoSQL complicó los totales por candidato.

**C. Appwrite**
- Ventajas: ofreció permisos por documento y fue autohospedable.
- Desventajas: exigió mantener la instancia o usar la nube con menor madurez; no tuvo consultas relacionales; la documentación y la comunidad fueron más limitadas para este caso.

## Decisión
Se eligió **Supabase**.

- **Identidad:** el usuario de Supabase Auth se creó con el **correo real** y su contraseña inicial. La cédula fue un campo único de `perfiles`. En el login, la app llamó a la función RPC `email_por_cedula(cedula)` (security definer, ejecutable por `anon`), que devolvió el correo, y luego ejecutó `signInWithPassword`. Se evaluó como alternativa un correo sintético `cedula@dominio`, que se descartó porque rompía la recuperación por correo real.
- **Creación de cuentas:** se realizó únicamente mediante las Edge Functions `crear-coordinador-recinto` y `crear-veedor`, que verificaron el rol de quien llamó a partir del JWT, validaron la cédula y crearon el usuario con la clave `service_role`, que existió solo como secreto del servidor. La app contuvo únicamente la `anon key`.
- **Cambio obligatorio:** se estableció `perfiles.debe_cambiar_clave = true` al crear la cuenta; una política RLS exigió `debe_cambiar_clave = false` para leer o escribir datos de negocio, y un guard en la app redirigió a cambiar la contraseña. Así no se pudo saltar desde una llamada directa a la API.
- **Roles:** se definió la columna `perfiles.rol` (`provincial`, `recinto`, `veedor`) y las funciones SQL `auth_rol()` y `auth_recinto_id()` usadas por las políticas.
- **Confirmación y recuperación:** el correo se envió mediante SMTP propio configurado en Supabase (proveedor con plan gratuito).

## Consecuencias
- Beneficios: las reglas de acceso fueron verificables con SQL y no hubo ninguna clave administrativa en el cliente.
- Obligaciones: se debieron mantener los scripts SQL versionados en `supabase/migrations` y los secretos solo en variables del servidor.
- Riesgos: (1) la RPC de cédula permitió enumerar correos; se limitó devolviendo solo el correo y aplicando límite de tasa, y se aceptó como riesgo documentado. (2) El plan gratuito se pausó por inactividad, por lo que se debió reactivar antes de la defensa.

## Verificación
- Se estableció una prueba SQL (`supabase/tests/rls.sql`): como veedor A, un `select` sobre actas de una mesa del veedor B debió devolver 0 filas y un `insert` debió fallar.
- Se definió que la búsqueda `grep -R "service_role" src/ www/ android/` no debía arrojar resultados.
- Se definió que, con la contraseña inicial sin cambiar, una consulta directa a `actas` con el JWT debía devolver 0 filas.
- Se definió que intentar crear un coordinador con la sesión de un veedor debía devolver 403.

## Uso de IA
- Herramienta: [Gemini IA]. Se consultó la comparación de Supabase, Firebase y Appwrite para reglas por rol y pertenencia.
- Respuesta sugerida: la herramienta recomienda elegir Supabase por el uso de PostgreSQL y Row Level Security (RLS) para controlar el acceso por rol y pertenencia (`auth.uid()`) directamente en la base de datos. 
- Aceptación/Rechazo: Aceptado. El equipo adoptará Supabase como backend para centralizar las reglas de seguridad y pertenencia a nivel de base de datos. 
- Verificación humana: el equipo creará las tablas en Supabase, habilitará las políticas RLS para los tres roles y comprobará mediante pruebas en `supabase/tests` que cada usuario solo accederá a sus registros permitidos.

## Trazabilidad
- Commit del ADR: git commit -m "docs(adr): propuestas ADR-001 a ADR-010"
- Commit de implementación: Pendiente

## Consenso del equipo
Pendiente