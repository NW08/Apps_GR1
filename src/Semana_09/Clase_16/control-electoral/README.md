# Control Electoral — Prueba 2

Aplicación móvil para gestionar, registrar y supervisar el escrutinio electoral de una organización política en **Pichincha / Quito**:
recintos, juntas receptoras del voto (JRV), actas de alcaldía y prefectura con foto y GPS, y un dashboard consolidado.

Desarrollo de Aplicaciones Móviles · ESFOT · EPN · Periodo 2026B · **Equipo 6** (línea base común) · desarrollo individual de
**Josué Ortiz**.

> Estado: en desarrollo. Las secciones marcadas como _pendiente_ se completan con la implementación.

---

## Tecnologías (línea base, [ADR-001](docs/adr/ADR-001-ionic-angular-standalone.md))

| Elemento | Versión |
|---|---|
| Node.js | 26.x |
| Angular / Angular CLI | 22.3 (TypeScript 6.0) |
| Ionic Angular (standalone) | 9.0 |
| Capacitor | 8.6 (Android, JDK 21) |
| Backend | Supabase: PostgreSQL + RLS, Auth, Storage, Edge Functions ([ADR-002](docs/adr/ADR-002-supabase-backend.md)) |

## Roles

| Rol | Puede |
|---|---|
| Coordinador provincial | Listar y crear recintos; crear y asignar un coordinador por recinto; ver avance de actas, mapa GPS y dashboard. |
| Coordinador de recinto | Ver las mesas de su recinto; crear veedores; asignar y reasignar veedores a JRV; corregir actas y fotos. |
| Veedor | Ver solo sus mesas; registrar y corregir las actas de alcaldía y prefectura con foto y GPS. |

## Instalación y ejecución

Requisitos: Node 26, Android Studio (SDK 36) y JDK 21. **No se instala nada globalmente**: todas las herramientas se usan con `npx`.

```bash
npm install
cp src/environments/environment.example.ts src/environments/environment.ts
cp src/environments/environment.example.ts src/environments/environment.prod.ts   # con production: true
npx ionic serve                     # navegador
npx ionic build --prod && npx cap sync android
```

_Pendiente:_ generación del APK.

## Configuración (sin secretos)

- `src/environments/environment.ts` y `environment.prod.ts` **no se versionan**; se crean a partir de `environment.example.ts` con la
  URL del proyecto de Supabase y la **anon key** (pública por diseño y protegida por RLS).
- La **service_role key** y las credenciales SMTP solo existen como secretos de las Edge Functions. Nunca están en la app ni en el
  repositorio.

_Pendiente:_ pasos para crear el proyecto de Supabase, aplicar `supabase/migrations` y `seed.sql` y desplegar las Edge Functions.

## Arquitectura ([ADR-004](docs/adr/ADR-004-arquitectura-capas.md))

Capas (presentación → dominio → datos) organizadas por funcionalidad:

```
src/app/
├── core/       supabase (cliente), auth (servicio y guardas), errors (manejo y traducción), ui (toasts)
├── domain/     models, rules (TypeScript puro: cédula, consistencia del acta)
├── data/       repositories, storage, functions (Edge Functions), offline (R10, opcional)
├── device/     cámara, GPS, permisos y nitidez
├── shared/     components (estado de vista), validators
└── features/   auth · provincial · recinto · veedor
supabase/
├── migrations/ esquema, RLS, vistas e índices
└── functions/  crear-coordinador-recinto · crear-veedor
```

Regla principal: solo `data/` importa `@supabase/supabase-js`; las páginas nunca hablan con el backend directamente.

## Modelo de datos ([ADR-008](docs/adr/ADR-008-modelo-relacional-rls-storage.md))

`recintos` → `jrv` → `actas` → `acta_votos`, más `perfiles`, `organizaciones`, `candidaturas` y `acta_historial`. Fotos en el bucket
privado `actas`. _Pendiente:_ diagrama.

## Pruebas ([ADR-010](docs/adr/ADR-010-pruebas-errores-monitoreo.md))

| Nivel | Qué | Comando |
|---|---|---|
| 1 | Reglas del dominio (cédula, consistencia, nitidez) | `npm run test:unit` |
| 2 | RLS de Supabase (veedor A no accede a la mesa del veedor B) | `npm run test:rls` (_pendiente_) |
| 3 | Lista manual sobre el APK | [`docs/pruebas-manuales.md`](docs/pruebas-manuales.md) (_pendiente_) |

## Credenciales de demostración

_Pendiente:_ cuentas no sensibles de provincial, coordinador de recinto y dos veedores.

## Decisiones de arquitectura

Los 10 ADR definitivos del equipo están en [`docs/adr/`](docs/adr/).

## Uso de IA

_Pendiente:_ anexo con herramientas, ejemplos de consultas, qué se aceptó o descartó y cómo se validó.

---

## Autor

- **Ortiz Josué** · EPN · Periodo 2026B
