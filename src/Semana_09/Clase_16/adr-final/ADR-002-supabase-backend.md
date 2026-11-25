# ADR-002: Usar Supabase (PostgreSQL, Auth, Storage y Edge Functions) como backend

| Campo | Valor |
|---|---|
| **Estado** | Aceptado |
| **Fecha** | 2026-11-24 |
| **Autor(es) y equipo** | Equipo 6: Eduardo Ganchala, Josué Ortiz |
| **Origen** | Propuesta de Eduardo Ganchala (su ADR-002). Rechaza la propuesta de Josué Ortiz (su ADR-002, Firebase). |
| **Requisitos relacionados** | R8 (backend, reglas por rol y pertenencia, persistencia de datos e imágenes), R2 y R3 (cuentas creadas por terceros sin claves administrativas en la app, ver ADR-007), R4 (dashboard con agregaciones, ADR-009), R10 (offline, ADR-006). |

## Contexto

El enunciado admite Firebase, Supabase o Appwrite. El backend debe cubrir:

1. autenticación con contraseña inicial, cambio obligatorio y recuperación por correo;
2. creación de cuentas por otros usuarios sin privilegios administrativos en la app;
3. autorización **en el servidor** por rol y pertenencia, demostrable (un veedor no accede a mesas ajenas);
4. almacenamiento privado de las fotos de actas;
5. consultas agregadas para el dashboard.

Criterios: expresividad de las reglas de acceso, consultas relacionales, **costo (preferible gratuito)** y experiencia del equipo.

## Alternativas consideradas

| Criterio | **A. Supabase** | B. Firebase | C. Appwrite |
|---|---|---|---|
| Modelo de datos | Relacional (PostgreSQL): `GROUP BY` y vistas para el dashboard. | Documental: sin *joins*; agregaciones limitadas. | Documental, consultas limitadas. |
| Reglas de acceso | Row Level Security en SQL; «mesas asignadas a mí» se expresa con *joins*. | Security Rules con *custom claims*; la pertenencia exige `get()` o desnormalizar. | Permisos por documento; menos expresivos. |
| Crear usuarios por terceros | Edge Functions con la `service_role` como secreto del servidor, **gratis en el plan Free**. | Cloud Functions + Admin SDK: **exige el plan Blaze** (tarjeta y pago por uso). | Functions con API key de servidor. |
| Offline | Sin offline nativo: cola propia (ADR-006). | Caché persistente de Firestore. | Sin offline nativo. |
| Fotos | Storage con políticas sobre el mismo modelo. | Cloud Storage con reglas. | Buckets con permisos. |
| Experiencia del equipo | Ambos la han usado. | Ambos la han usado. | Josué no la ha usado. |
| Costo | Plan Free suficiente; el proyecto se pausa tras inactividad. | Blaze obligatorio para Functions. | Nube gratuita o autoalojado. |

## Decisión

Se elige **Supabase** en el plan **Free**, un proyecto por integrante (entregas individuales):

- **PostgreSQL** con el esquema, políticas RLS, vistas e índices de ADR-008, versionados en `supabase/migrations/` y `supabase/seed.sql`.
- **Auth** con correo y contraseña; la cédula es el identificador visible (ADR-007).
- **Storage** con un bucket privado `actas` y URLs firmadas de corta duración (ADR-008).
- **Edge Functions** solo para operaciones privilegiadas (crear coordinadores y veedores, ADR-007).
- La app usa únicamente la **anon key** (pública por diseño, protegida por RLS) en `environment.ts`, que no se versiona; se versiona
  `environment.example.ts`. La `service_role` existe solo como secreto de las Edge Functions.

## Consecuencias

- **Beneficios:** reglas de acceso verificables con SQL; agregaciones del dashboard en el servidor; sin costo.
- **Obligaciones:** mantener las migraciones versionadas; aplicarlas en el proyecto real antes de generar el APK.
- **Limitaciones:** sin offline nativo (R10 requiere una cola propia, ADR-006); límite bajo de correos con el SMTP por defecto.
- **Riesgos:**
  - Una política RLS mal escrita abre datos ajenos o bloquea a usuarios legítimos. **Mitigación:** pruebas de RLS por rol (ADR-010).
  - El plan Free pausa el proyecto por inactividad. **Mitigación:** reactivarlo y comprobarlo antes de la defensa.

## Verificación

- `supabase/migrations/` y `supabase/seed.sql` existen en el repositorio y se aplican sin errores.
- `git grep -i "service_role" -- src android` sin resultados.
- Prueba de RLS: el veedor A no obtiene la mesa ni el acta del veedor B (ADR-010).

## Uso de IA

- **Eduardo Ganchala · Gemini:** comparación de Supabase, Firebase y Appwrite; recomendó Supabase por PostgreSQL y RLS. Se aceptó.
- **Josué Ortiz · Claude (Anthropic):** la misma comparación recomendó Firebase con plan Blaze. **Se rechazó** en la deliberación
  por el costo del plan Blaze.
- **Verificación humana:** se confirmó que Cloud Functions exige Blaze y que las Edge Functions de Supabase funcionan en el plan Free.

## Trazabilidad

- Propuestas: `adr-edu/ADR-002-supabase-auth-roles.md` (aceptada) · `adr-mio/ADR-002-firebase-backend.md` (rechazada).
- Commit del ADR: [enlace]
- Commit de implementación: [enlace: cliente de Supabase y primera migración]

## Consenso del equipo

| Integrante | Postura y argumentos | Objeciones |
|---|---|---|
| Eduardo Ganchala | Supabase: relacional, RLS por rol y pertenencia, Edge Functions gratuitas y agregaciones SQL para el dashboard. | Firebase exige el plan Blaze para Cloud Functions. |
| Josué Ortiz | Firebase: caché offline nativa, Security Rules con *claims* y correos nativos de Auth. | Supabase no tiene offline nativo. |

**Desacuerdo relevante:** el plan Blaze de Firebase.

**Acuerdo final:** Supabase. No se vio factible gastar dinero habiendo opciones gratuitas y comunitarias que cubren R2, R3 y R8; la
falta de offline nativo se asume con una cola propia (ADR-006). · **Minuto del video:** [mm:ss–mm:ss]
