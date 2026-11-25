# ADR-004: Organizar la aplicación en capas (presentación, dominio y datos) con carpetas por funcionalidad y repositorios que encapsulan Firebase

| Campo | Valor |
|---|---|
| **Estado** | Aceptado (los repositorios encapsulan Supabase en lugar de Firebase, ADR-002) |
| **Fecha** | 2026-11-23 |
| **Autor(es) y equipo** | Josué Ortiz · Equipo 6: Eduardo Ganchala, Josué Ortiz |
| **Requisitos relacionados** | R9 (separar presentación, lógica de negocio y acceso a datos), R4–R6 (tres áreas funcionales por rol), R8 (el acceso a datos pasa por un solo punto), R10 (la sincronización se inserta en la capa de datos). |

## Contexto

Tres roles con pantallas distintas comparten las mismas entidades (recinto, mesa, acta, usuario). En la defensa se preguntará «¿cómo
se distribuyen las responsabilidades entre interfaz, lógica y persistencia?». Además:

- las reglas de negocio (consistencia de totales, validar cédula, estados de la mesa) deben poder probarse **sin** Firebase ni Ionic;
- si cambia el backend o se añade el modo offline, no debería tocarse ninguna página.

## Alternativas consideradas

| Criterio                        | **A. Capas + carpetas por funcionalidad (feature-first)**         | B. Carpetas por tipo técnico (`pages/`, `services/`, `models/`)        | C. Páginas que llaman directamente a Firebase     |
| ------------------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------- |
| Separación de responsabilidades | Explícita: página → servicio de dominio → repositorio → Firebase. | Existe, pero las funcionalidades quedan repartidas en muchas carpetas. | Nula: lógica y acceso a datos mezclados en la UI. |
| Encontrar el código de un rol   | Una carpeta por rol/funcionalidad.                                | Hay que buscar en cuatro carpetas.                                     | Fácil, pero todo en un archivo.                   |
| Pruebas de la lógica            | Funciones puras y servicios con repositorios simulados (*mock*).  | Igual que A.                                                           | Imposible sin Firebase.                           |
| Esfuerzo inicial                | Medio.                                                            | Bajo.                                                                  | Mínimo.                                           |
| Riesgo                          | Sobreingeniería si se abusa de las capas.                         | Crece desordenada.                                                     | Incumple R9.                                      |

## Decisión

Arquitectura en **tres capas** dentro de una estructura **por funcionalidad**:

```
src/app/
├── core/                    # transversal (singletons)
│   ├── auth/                # AuthService, guards (auth, rol, cambio de contraseña)
│   ├── firebase/            # inicialización (providers), conversores
│   ├── errors/              # ErrorHandler global, mapeo de códigos de Firebase → mensajes en español
│   └── ui/                  # ToastService, LoadingService
├── domain/                  # SIN Angular ni Firebase: TypeScript puro
│   ├── models/              # interfaces: Recinto, Mesa, Acta, Usuario, Organizacion, Candidatura, enums de estado y rol
│   ├── rules/               # cedula.ts, acta-consistency.ts, mesa-status.ts (funciones puras + .spec.ts)
│   └── ports/               # interfaces de repositorio (ActaRepository, MesaRepository…)
├── data/                    # implementaciones con Firebase de los puertos
│   ├── firestore/           # FirestoreActaRepository, FirestoreMesaRepository… (con conversores tipados)
│   ├── storage/             # PhotoStorageRepository
│   ├── functions/           # AccountsApi (callable functions)
│   └── offline/             # OutboxService (ADR-006, opcional)
├── device/                  # CameraService, GeolocationService, DevicePermissionsService, image-quality.util.ts
├── shared/                  # componentes reutilizables (estado de carga/error/vacío, tarjeta de mesa, selector de veedor)
└── features/
    ├── auth/                # login, cambio de contraseña, recuperación
    ├── provincial/          # recintos, coordinadores, avance, mapa/GPS, dashboard
    ├── recinto/             # mesas, veedores, asignación, corrección de actas
    └── veedor/              # mis mesas, registro y corrección de actas
```

**Reglas de dependencia:**

1. `features/*` (presentación) solo usa servicios de funcionalidad/dominio y componentes de `shared/`. **Nunca importa `firebase/*`.**
2. Los servicios de funcionalidad (p. ej. `ActaFormService`, `VeedorMesasStore`) orquestan los casos de uso y usan los **puertos**
   del dominio, inyectados con `InjectionToken`.
3. `data/*` implementa los puertos y es la **única** capa que importa el SDK de Firebase.
4. `domain/*` no importa nada de Angular, Ionic ni Firebase.
5. Las rutas de cada funcionalidad se cargan perezosamente (`loadComponent` / `loadChildren`) y están protegidas por guardas (ADR-005).

## Consecuencias

- **Beneficios:**
  - Respuesta directa a la pregunta de la defensa, con un diagrama en el README.
  - Las reglas de negocio se prueban en milisegundos.
  - El modo offline (ADR-006) se añade en `data/` sin tocar las páginas.
- **Obligaciones:**
  - Respetar las reglas de dependencia; se revisa con `git grep "from 'firebase" src/app/features` (debe dar vacío).
  - Cada puerto tiene una sola implementación real y, en las pruebas, un *mock*.
- **Limitaciones:** más archivos que la alternativa C; para 4 días se evita crear capas vacías (solo se crean puertos para las
  entidades con persistencia).
- **Riesgo:** «fugas» de tipos de Firebase (`Timestamp`, `DocumentReference`) hacia el dominio. **Mitigación:** los conversores de
  Firestore (`withConverter`) traducen a `Date` y a ids de tipo `string` en `data/`.

## Verificación

- `git grep -n "from 'firebase" src/app/features src/app/domain` → sin resultados.
- `domain/rules/*.spec.ts` se ejecutan sin TestBed ni emulador.
- Diagrama de capas y árbol de carpetas en el README.
- En la defensa: seguir el recorrido de «guardar acta» desde `acta-form.page.ts` → `ActaFormService` → `ActaRepository` →
  `FirestoreActaRepository`.

## Uso de IA

- **Herramienta:** Claude (Anthropic).
- **Consulta:** estructura de carpetas para Ionic Angular standalone con tres roles y Firebase.
- **Respuesta sugerida:** capas + funcionalidades + puertos/repositorios.
- **Aceptación / rechazo:** se aceptaron las capas (presentación, dominio y datos), las carpetas por
  funcionalidad y los repositorios. Tras la deliberación solo cambia el backend que encapsulan los repositorios: Supabase en lugar
  de Firebase (ADR-002).
- **Verificación humana:** se verificará que ninguna página ni componente importe el cliente de Supabase
  (`git grep "@supabase/supabase-js" -- src/app/features`, solo en repositorios) y que el acceso a datos pase únicamente por los
  repositorios.

## Trazabilidad

- Commit del ADR: [enlace]
- Commit de implementación: [enlace: esqueleto de carpetas y primer repositorio]

## Consenso del equipo

| Integrante | Postura y argumentos | Objeciones |
|---|---|---|
| Josué Ortiz | Capas (presentación, dominio y datos) con carpetas por funcionalidad y repositorios que aíslan el backend: es más fácil de defender, de identificar el código y de saber dónde modificar un cambio o un componente. | Ninguna |
| Eduardo Ganchala | Arquitectura por capas organizada por tipo técnico (páginas, servicios, modelos), con repositorios que aíslan Supabase. | Ninguna |

**Acuerdo final:** arquitectura por capas organizada por funcionalidad y con repositorios. Se elige la organización por
funcionalidad porque facilita la defensa, ubicar el código de cada rol y saber dónde hacer un cambio. ·
**Minuto del video:** [mm:ss–mm:ss]
