# ADR-002: Usar Firebase (Authentication, Cloud Firestore, Cloud Storage y Cloud Functions) como backend

| Campo | Valor |
|---|---|
| **Estado** | Rechazado: el equipo adoptó Supabase (decisión final ADR-002, propuesta de Eduardo Ganchala) |
| **Fecha** | 2026-11-23 |
| **Autor(es) y equipo** | Josué Ortiz · Equipo 6: Eduardo Ganchala, Josué Ortiz |
| **Requisitos relacionados** | R8 (backend, reglas por rol y pertenencia, persistencia de datos e imágenes), R2 (creación jerárquica de cuentas y correo de confirmación), R3 (autenticación, cambio de contraseña, recuperación por correo, sin claves administrativas en la app), R4 (dashboard), R10 (offline, opcional). |

## Contexto

Necesitamos un backend gestionado (solo se admiten Firebase, Supabase o Appwrite) que cubra:

1. **Autenticación:** contraseña inicial común, cambio obligatorio y recuperación por correo.
2. **Creación de cuentas por terceros:** el provincial crea coordinadores y el coordinador crea veedores. Hacerlo exige privilegios
   administrativos que **no pueden estar en la app** (R3).
3. **Autorización en el servidor por rol y pertenencia:** un veedor no puede leer ni escribir mesas ajenas, y hay que **demostrarlo** (R8).
4. **Almacenamiento de fotos de actas** con las mismas reglas.
5. **Consultas agregadas** para el dashboard.
6. **Persistencia offline** (bonificación R10).

Criterios: tiempo de aprendizaje con 4 días de plazo, coste (preferible gratuito), madurez del SDK web dentro de Capacitor, y
posibilidad de probar las reglas en local.

## Alternativas consideradas

| Criterio | **A. Firebase** | B. Supabase | C. Appwrite |
|---|---|---|---|
| Modelo de datos | Documental (Firestore). Las agregaciones `count`/`sum` se resuelven en el servidor. | Relacional (PostgreSQL): agregaciones con SQL, ideal para el dashboard. | Documental, con consultas más limitadas. |
| Reglas de acceso | Security Rules declarativas, con *custom claims* (rol y recinto en el token). Se prueban con el Emulator Suite y `@firebase/rules-unit-testing`. | Row Level Security en SQL (potente, pero hay que dominar las políticas de PostgreSQL). | Permisos por documento, colección y equipo; menos expresivos para «veedor asignado a esta mesa». |
| Crear usuarios por terceros | Cloud Functions + Admin SDK (**requiere el plan Blaze**, de pago por uso con cuota gratuita). | Edge Functions con la `service_role` key (gratis en el plan Free). | Functions con una API key de servidor. |
| Correos (confirmación y recuperación) | Plantillas nativas de Auth (verificación y restablecimiento), sin SMTP propio. | Plantillas nativas con límite bajo de envíos en el plan Free (SMTP propio recomendado). | Requiere SMTP configurado. |
| Offline | **Caché persistente de Firestore con cola de escrituras automática**: base directa para R10. | Sin offline nativo: habría que construir una cola propia. | Sin offline nativo. |
| Fotos | Cloud Storage con reglas que pueden consultar Firestore (`firestore.get`). | Storage con RLS. | Storage con permisos por bucket y archivo. |
| Experiencia del equipo | Ambos integrantes la han usado. | Ambos integrantes la han usado. | Josué Ortiz no la ha usado; Eduardo Ganchala no lo indicó. |
| Coste | Spark gratuito; **Blaze obligatorio para Functions** (tarjeta registrada; la cuota gratuita cubre de sobra el examen). | Free tier suficiente; los proyectos se pausan tras inactividad. | Cloud gratuito o autoalojado. |

## Decisión

Se elige **Firebase** con:

- **Authentication** (correo y contraseña; el identificador visible es la cédula, ver ADR-007);
- **Cloud Firestore** como base de datos, en modo nativo y en la región `southamerica-east1` (o la más cercana disponible);
- **Cloud Storage** para las fotos de actas;
- **Cloud Functions** (2.ª generación, TypeScript) **solo** para las operaciones privilegiadas: crear cuentas, asignar *custom claims*,
  marcar el cambio de contraseña y sembrar los datos iniciales (ADR-007, ADR-008);
- **Emulator Suite** para desarrollar y probar las reglas sin tocar producción.

El SDK que se usa en la app es el **Firebase JS SDK modular**, envuelto en repositorios (ADR-004); ver la consideración de
persistencia de Auth en Capacitor en ADR-007.

**Condiciones:**

- Proyecto en el **plan Blaze** con una **alerta de presupuesto de 1 USD** desde el primer día.
- Cada integrante usa **su propio proyecto de Firebase** (entregas individuales). La configuración web (`apiKey`, `projectId`…) no es
  secreta, pero se excluye del repositorio mediante `environment.*.ts` en `.gitignore` y un `environment.example.ts`.
- Ninguna credencial del Admin SDK (cuenta de servicio) existe en la app ni en el repositorio.

## Consecuencias

- **Beneficios:**
  - Las reglas declarativas y comprobables con el emulador permiten **demostrar** R8 con pruebas automáticas.
  - El offline de Firestore resuelve gran parte de R10.
  - Los correos nativos de Auth evitan configurar SMTP.
- **Obligaciones:**
  - Mantener `firestore.rules`, `storage.rules` y las Functions versionadas en el repositorio (`firebase/`).
  - Desplegar con `firebase deploy`.
- **Limitaciones:**
  - Firestore no hace *joins*: el modelo se desnormaliza (ADR-008).
  - Las agregaciones solo funcionan en línea.
- **Riesgos:**
  - **Coste del plan Blaze** (bajo con la alerta de presupuesto). Si algún integrante no puede registrar una tarjeta, se aplica la
    alternativa B de ADR-007 (crear las cuentas desde el cliente con una segunda instancia de Auth y roles en Firestore), con menos
    seguridad. Debe quedar en un ADR de reemplazo.
  - **Dependencia de un proveedor** (vendor lock-in): se mitiga con la capa de repositorios.

## Verificación

- `firebase.json`, `firestore.rules`, `storage.rules` y `functions/` existen en el repositorio.
- `firebase emulators:exec "npm test"` ejecuta las pruebas de reglas (ADR-008), incluida «un veedor no puede leer la mesa de otro»,
  y pasan.
- En la consola de Firebase: alerta de presupuesto configurada (captura en `docs/evidencias/`).
- Búsqueda en el repositorio (`git grep -i "private_key"`) sin resultados.

## Uso de IA

- **Herramienta:** Claude (Anthropic).
- **Consulta:** comparación de Firebase, Supabase y Appwrite para los requisitos R2, R3, R8 y R10.
- **Respuesta sugerida:** Firebase + Functions con plan Blaze; alternativa sin Functions documentada.
- **Aceptación / rechazo:** se aceptó la comparación de las tres alternativas, pero **se rechazó la recomendación de Firebase**. En la
  deliberación el equipo descartó pagar el plan Blaze habiendo opciones gratuitas y comunitarias, y adoptó Supabase, que cubre la
  creación de cuentas por terceros con Edge Functions en el plan Free.
- **Verificación humana:** en la deliberación se confirmó que Cloud Functions exige el plan Blaze (pago por uso con tarjeta
  registrada); ese costo fue el motivo del rechazo.

## Trazabilidad

- Commit del ADR: [enlace]
- Commit de implementación: no aplica (propuesta rechazada); la implementación sigue la decisión final ADR-002 (Supabase).

## Consenso del equipo

| Integrante | Postura y argumentos | Objeciones |
|---|---|---|
| Josué Ortiz | Firebase: caché persistente de Firestore como base directa para R10, Security Rules con *custom claims* comprobables con el emulador y correos nativos de Auth sin SMTP propio. | Supabase no tiene offline nativo: R10 exige construir una cola propia. |
| Eduardo Ganchala | Supabase: modelo relacional (PostgreSQL) con agregaciones SQL para el dashboard, Row Level Security por rol y pertenencia, y Edge Functions gratuitas para crear cuentas sin exponer claves administrativas. | Firebase exige el plan Blaze (tarjeta y pago por uso) para Cloud Functions. |

**Desacuerdo relevante:** el plan Blaze de Firebase.

**Acuerdo final:** Supabase. No se vio factible gastar dinero habiendo opciones gratuitas y comunitarias que cubren R2, R3 y R8. La
falta de offline nativo se asume con una cola propia (decisión final ADR-006). ·
**Minuto del video:** [mm:ss–mm:ss]
