# ADR-004: Organizar la aplicación en capas (presentación, dominio y datos) con carpetas por funcionalidad y repositorios que encapsulan Supabase

| Campo | Valor |
|---|---|
| **Estado** | Aceptado |
| **Fecha** | 2026-11-24 |
| **Autor(es) y equipo** | Equipo 6: Eduardo Ganchala, Josué Ortiz |
| **Origen** | Propuesta de Josué Ortiz (su ADR-004), adaptada a Supabase. Sustituye a la propuesta de Eduardo Ganchala (su ADR-004, por tipo técnico). |
| **Requisitos relacionados** | R9 (separar presentación, lógica de negocio y acceso a datos), R4–R6 (tres áreas funcionales por rol), R8 (el acceso a datos pasa por un solo punto), R10 (la sincronización se inserta en la capa de datos). |

## Contexto

Tres roles con pantallas distintas comparten las mismas entidades (recinto, mesa, acta, usuario). En la defensa se pregunta cómo se
reparten las responsabilidades entre interfaz, lógica y persistencia, y hay que **ubicar y modificar código en vivo**. Las reglas de
negocio (consistencia de totales, cédula, estado de la mesa) deben probarse sin Supabase ni Ionic, y un cambio de backend o el modo
offline no deberían tocar las páginas.

## Alternativas consideradas

| Criterio | **A. Capas + carpetas por funcionalidad** | B. Capas + carpetas por tipo técnico (`pages/`, `services/`, `models/`) | C. Páginas que llaman directamente a Supabase |
|---|---|---|---|
| Separación de responsabilidades | Explícita: página → servicio → repositorio → Supabase. | Existe, pero cada funcionalidad queda repartida en varias carpetas. | Nula: lógica y datos en la UI. |
| Encontrar el código de un rol | Una carpeta por rol. | Buscar en varias carpetas. | Todo en un archivo. |
| Pruebas de la lógica | Funciones puras y repositorios simulados. | Igual que A. | Imposible sin red. |
| Esfuerzo inicial | Medio. | Bajo. | Mínimo. |
| Riesgo | Sobreingeniería si se abusa de las capas. | Crece desordenada. | Incumple R9. |

## Decisión

Tres capas dentro de una estructura **por funcionalidad**:

```
src/app/
├── core/          # singletons: supabase.client.ts, auth (AuthService, guards), errors (ErrorHandler, mapeo de errores), ui (toasts)
├── domain/        # TypeScript puro, sin Angular ni Supabase
│   ├── models/    # Recinto, Mesa, Acta, Perfil, Organizacion, Candidatura, enums de rol y estado
│   └── rules/     # cedula.ts, acta-consistency.ts (funciones puras + .spec.ts)
├── data/          # única capa que importa @supabase/supabase-js
│   ├── repositories/   # ActaRepository, MesaRepository, RecintoRepository, PerfilRepository, DashboardRepository
│   ├── storage/        # FotoActaRepository (bucket privado, URLs firmadas)
│   ├── functions/      # CuentasApi (Edge Functions de ADR-007)
│   └── offline/        # cola de pendientes (ADR-006, opcional)
├── device/        # CameraService, GeolocationService, DevicePermissionsService, image-quality.util.ts
├── shared/        # componentes reutilizables (<app-estado-vista>, tarjeta de mesa), validadores
└── features/
    ├── auth/        # login, cambio de contraseña, recuperación
    ├── provincial/  # recintos, coordinadores, avance, mapa GPS, dashboard
    ├── recinto/     # mesas, veedores, asignación, corrección de actas
    └── veedor/      # mis mesas, registro y corrección de actas
```

**Reglas de dependencia:**

1. `features/*` solo usa servicios y componentes de `shared/`; **nunca importa `@supabase/supabase-js`**.
2. Los servicios de cada funcionalidad (p. ej. `ActaFormService`, `VeedorMesasStore`) orquestan los casos de uso y usan los repositorios.
3. `data/*` es la única capa que habla con Supabase y traduce filas (`snake_case`) a modelos del dominio.
4. `domain/*` no importa Angular, Ionic ni Supabase.
5. Las rutas de cada funcionalidad se cargan con `loadComponent` y se protegen con guardas (ADR-005).

## Consecuencias

- **Beneficios:** respuesta directa a la pregunta de la defensa; cada rol se ubica en una carpeta; las reglas de negocio se prueban en
  milisegundos; el modo offline se añade en `data/` sin tocar páginas.
- **Obligaciones:** respetar las reglas de dependencia; diagrama de capas en el README.
- **Limitaciones:** más archivos que la alternativa C; solo se crean repositorios para entidades con persistencia.
- **Riesgo:** «fugas» de tipos del cliente de Supabase (`PostgrestError`, filas con `snake_case`) hacia las páginas.
  **Mitigación:** los repositorios devuelven modelos del dominio y errores ya traducidos (ADR-005).

## Verificación

- `git grep -n "@supabase/supabase-js" -- src/app/features src/app/domain` sin resultados.
- `domain/rules/*.spec.ts` se ejecutan sin TestBed ni red.
- En la defensa: recorrido de «guardar acta» `acta-form.page.ts` → `ActaFormService` → `ActaRepository` → RPC `guardar_acta` → RLS.

## Uso de IA

- **Josué Ortiz · Claude (Anthropic):** estructura de carpetas para Ionic Angular standalone con tres roles; sugirió capas +
  funcionalidades + repositorios. Se aceptó; el backend encapsulado cambió de Firebase a Supabase.
- **Eduardo Ganchala · Gemini:** separación en capas con repositorios organizados por tipo técnico. Sustituida por la organización por
  funcionalidad.
- **Verificación humana:** revisión del árbol de carpetas en ambos repositorios y del `git grep` de la sección anterior.

## Trazabilidad

- Propuestas: `adr-mio/ADR-004-arquitectura-capas.md` (aceptada) · `adr-edu/ADR-004-arquitectura-por-capas.md` (sustituida).
- Commit del ADR: [enlace]
- Commit de implementación: [enlace: esqueleto de carpetas y primer repositorio]

## Consenso del equipo

| Integrante | Postura y argumentos | Objeciones |
|---|---|---|
| Josué Ortiz | Capas + carpetas por funcionalidad + repositorios: más fácil de defender, de identificar el código y de saber dónde modificar un cambio o un componente. | Ninguna |
| Eduardo Ganchala | Capas organizadas por tipo técnico, con repositorios que aíslan Supabase. | Ninguna |

**Acuerdo final:** arquitectura por capas organizada por funcionalidad y con repositorios. · **Minuto del video:** 00:28:10–00:38:29 (consenso 00:36:25–00:38:29)
