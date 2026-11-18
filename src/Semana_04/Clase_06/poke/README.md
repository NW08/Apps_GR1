# PokéAPP || `SEMANA 04 - CLASE 06 (21|10|2026)`

> Aplicación móvil Ionic para **buscar, explorar y comparar Pokémon**, con galería multimedia, sonidos oficiales y una arena de combate, consumiendo la API pública **PokéAPI REST v2**.

---

## 1. Descripción del Proyecto

Práctica formativa de la materia de Desarrollo de Aplicaciones Móviles. El objetivo es construir una aplicación visualmente atractiva que consuma un servicio REST público y aproveche recursos multimedia (imágenes, animaciones y audio), organizada en tres niveles de complejidad:

- **Nivel 1:** buscador y detalle de cada Pokémon con un diseño agradable.
- **Nivel 2:** multimedia: sonido, galería de imágenes y GIF animado.
- **Nivel 3:** comparador de dos Pokémon y simulación de combate.

Alcance:

- No hay autenticación, base de datos ni almacenamiento propio: toda la información se consulta en tiempo real a [PokéAPI](https://pokeapi.co/).
- La app está preparada para publicarse en Android (`ec.edu.epn.pokeapp`), con su [política de privacidad](./PRIVACY.md).

---

## 2. Integrantes

- **Ganchala Eduardo**
- **Ortiz Josué**

EPN · Periodo 2026B. Los aportes de cada uno están en [Distribución del Trabajo](#11-distribución-del-trabajo).

---

## 3. Objetivo y Funcionalidades

**Objetivo:** construir una aplicación Ionic que consuma PokéAPI para buscar y mostrar Pokémon con recursos multimedia, y que permita comparar a dos de ellos en una simulación de combate.

### Nivel 1: Buscador y detalle

| Funcionalidad        | Implementación                                                                                                               |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Buscador             | `ion-searchbar` con _debounce_ de 700 ms; acepta nombre o número de Pokédex (ej. `pikachu` o `25`).                          |
| Listado inicial      | Cuadrícula con los primeros 20 Pokémon (`/pokemon?limit=20`); tocar uno abre su detalle.                                     |
| Detalle completo     | Nombre, número, tipos (`ion-badge`), altura, peso y descripción de la especie (en español, con respaldo en inglés).         |
| Estadísticas base    | `ion-progress-bar` para HP, Ataque, Defensa, Ataque Especial, Defensa Especial y Velocidad (normalizadas sobre 255).         |
| Estados de la vista  | `ion-spinner` mientras se consulta y mensaje de error si el Pokémon no existe.                                               |

### Nivel 2: Multimedia

| Funcionalidad      | Implementación                                                                                                              |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| Sonido             | Reproduce el grito oficial (`cries.latest`, con respaldo `cries.legacy`) mediante `Audio` de HTML5.                         |
| Galería            | Hasta 14 imágenes: arte oficial, Pokémon HOME, sprites clásicos, shiny, Showdown, Dream World, Gen V animado y femenino.     |
| Imagen ampliada    | Tocar una miniatura la muestra como imagen principal.                                                                       |
| GIF animado        | Botón para alternar entre la ilustración estática y la animación de Pokémon Showdown (o Gen V).                            |

### Nivel 3: Comparador y combate

| Funcionalidad          | Implementación                                                                                                                  |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Selección de luchadores | Búsqueda por nombre o ID para cada lado, o chips de sugerencias rápidas (Pikachu, Charizard, Mewtwo, Gengar, etc.).            |
| Cuadro comparativo     | HP, Ataque, Defensa, Ataque Esp., Defensa Esp., Velocidad, total, peso y altura, resaltando quién lidera cada estadística.       |
| Simulación de combate  | Calcula un poder ponderado (ataques ×1.3, velocidad ×1.2, defensas ×1.1, HP ×1.0), anuncia al ganador o el empate y reproduce su grito. |
| Reinicio               | Botón para limpiar ambos luchadores y empezar otra batalla.                                                                     |

---

## 4. Tecnologías y Componentes Ionic

### Tecnologías

| Tecnología                                                | Uso                                                              |
| --------------------------------------------------------- | ---------------------------------------------------------------- |
| [Ionic 9](https://ionicframework.com/)                    | Componentes de interfaz móvil                                    |
| [Angular 22](https://angular.dev/) (standalone)           | Componentes standalone, `HttpClient` y rutas diferidas           |
| [RxJS](https://rxjs.dev/)                                 | `forkJoin` para consultar detalle, especie y sprites en paralelo |
| [PokéAPI REST v2](https://pokeapi.co/docs/v2)             | Fuente de datos, imágenes y sonidos                              |
| [Capacitor 8](https://capacitorjs.com/)                   | Compilación nativa para Android                                  |
| ESLint · Prettier · Vitest · Playwright                   | Calidad de código y pruebas                                      |

### Componentes Ionic utilizados

| Componente                                                                 | Dónde se usa                                                        |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `ion-segment` / `ion-segment-button`                                       | Navegación entre **Pokédex** y **Comparar & Batalla**               |
| `ion-searchbar`                                                            | Buscador de la Pokédex y de cada luchador                           |
| `ion-grid` / `ion-row` / `ion-col`                                         | Cuadrícula del listado inicial y cuadro comparativo                 |
| `ion-card` y sus partes (`header`, `title`, `subtitle`, `content`)         | Detalle, galería, luchadores y resultado del combate                |
| `ion-badge`, `ion-chip`                                                    | Tipos de cada Pokémon y sugerencias rápidas                         |
| `ion-progress-bar`                                                         | Estadísticas base                                                   |
| `ion-spinner`, `ion-text`                                                  | Indicadores de carga y mensajes de error                            |
| `ion-avatar`, `ion-button` / `ion-buttons`, `ion-icon`, `ion-label`        | Logo, acciones (sonido, GIF, pelear, reiniciar) e iconografía       |
| `ion-header` / `ion-toolbar` / `ion-title` / `ion-content`                 | Estructura de la página                                             |

---

## 5. Arquitectura

### Estructura de carpetas

```
PokeAPP/
├── android/                              # Proyecto nativo (Capacitor) con la firma de release
│   └── keystore.properties.example       # Plantilla de credenciales de firma (el real no se versiona)
├── docs/evidencias/                      # Capturas de la app
├── resources/                            # Ícono y splash fuente para @capacitor/assets
├── src/
│   ├── app/
│   │   ├── services/pokemon.ts           # Acceso a PokéAPI
│   │   ├── home/                         # Pokédex, galería, comparador y combate
│   │   ├── pages/pokemos-detail/         # Página secundaria (plantilla)
│   │   └── app.routes.ts                 # Rutas con carga diferida
│   ├── assets/                           # Logo e íconos
│   ├── theme/variables.scss
│   └── global.scss
├── PRIVACY.md                            # Política de privacidad para la tienda
└── capacitor.config.ts                   # appId ec.edu.epn.pokeapp
```

### Servicio de datos (`Pokemon`)

Es el único punto de acceso a PokéAPI (`https://pokeapi.co/api/v2`). La página principal solo llama a sus métodos.

| Método                          | Endpoint / Operación                                                       |
| ------------------------------- | -------------------------------------------------------------------------- |
| `getPokemons(limit, offset)`    | `GET /pokemon?limit=&offset=`: listado paginado                            |
| `pokemonDetails(nombreOId)`     | `GET /pokemon/{nombreOId}`: tipos, estadísticas, medidas, sprites y gritos |
| `pokemonSpecies(nombreOId)`     | `GET /pokemon-species/{nombreOId}`: descripción (`flavor_text_entries`)    |
| `pokemonAbilities(nombreOId)`   | `GET /ability/{nombreOId}`: detalle de una habilidad                       |
| `pokemonSprites(nombreOId)`     | Arma la galería, la imagen principal y el GIF a partir de `sprites`        |
| `pokemonSound(url)`             | Reproduce un audio con `new Audio(url).play()`                             |

---

## 6. Fuente de Datos: Supabase y Firebase

**PokéAPP no utiliza Supabase ni Firebase.** No guarda información del usuario ni necesita un _backend_ propio. Todos los datos se leen de PokéAPI, una API pública, gratuita y de solo lectura que **no requiere API key**. Por eso el proyecto no tiene archivo `.env` ni credenciales de servicios en la nube.

| Servicio      | ¿Se usa? | Motivo                                                                                                        |
| ------------- | :------: | ------------------------------------------------------------------------------------------------------------- |
| PokéAPI       | ✅       | Única fuente de datos, imágenes y sonidos (solo lectura, sin autenticación).                                  |
| Firebase      | ❌       | No hay datos propios que guardar, ni autenticación ni hosting en esta práctica.                               |
| Supabase      | ❌       | No hay base de datos ni almacenamiento propio.                                                                |

Si en una versión futura se agregaran funciones como **favoritos sincronizados**, **historial de batallas** o **inicio de sesión**, se usaría Firebase (Firestore y Authentication) o Supabase (PostgreSQL y Auth). Su configuración pública iría en un `.env` no versionado (el `.gitignore` ya lo excluye), y la protección real dependería de las reglas de seguridad (Firestore Rules o Row Level Security), nunca de ocultar la configuración web.

---

## 7. Instalación y Ejecución

### Requisitos

| Herramienta                                            | Versión                                |
| ------------------------------------------------------ | -------------------------------------- |
| [Node.js](https://nodejs.org/) y npm                   | Node 22.22+, 24.15+ o 26+              |
| [Ionic CLI](https://ionicframework.com/docs/intro/cli) | Global (`npm i -g @ionic/cli`) o `npx` |
| [Android Studio](https://developer.android.com/studio) | Solo para compilar en Android          |

### Pasos

1. **Clonar e instalar dependencias**

```bash
git clone https://github.com/Eduxrd-o/PokeAPP.git
cd PokeAPP
npm install
```

2. **Ejecutar en el navegador**

```bash
npx ionic serve
```

La app se abre en `http://localhost:8100/`. Usa el modo dispositivo de las herramientas de desarrollo (F12) para verla en formato móvil. No requiere configuración adicional porque PokéAPI no usa claves.

3. **Compilar para Android**

```bash
npx ionic build
npx cap sync android
npx cap open android
```

La carpeta `android/` ya forma parte del repositorio, por lo que **no** se ejecuta `npx cap add android`. Desde Android Studio se puede ejecutar en un dispositivo o generar un APK de depuración (**Build > Build APK(s)**).

4. **Firma de release (opcional, para publicar)**

```bash
cp android/keystore.properties.example android/keystore.properties
```

Completa `android/keystore.properties` con la ruta y las contraseñas de tu keystore y luego genera el paquete firmado desde **Build > Generate Signed App Bundle / APK**. Si el archivo no existe, la configuración de firma se omite y el proyecto compila igual en modo debug.

Calidad de código: `npm run lint` (ESLint, tipos de e2e y Prettier) y `npm run test:unit` (Vitest).

---

## 8. Evidencias

Capturas guardadas en [`docs/evidencias/`](./docs/evidencias/).

### Pokédex

| Listado inicial | Búsqueda y detalle | Estadísticas |
| :---: | :---: | :---: |
| ![Listado inicial](docs/evidencias/01-listado-inicial.jpg) | ![Detalle](docs/evidencias/02-detalle-pokemon.jpg) | ![Estadísticas](docs/evidencias/03-estadisticas.jpg) |

### Multimedia

| Galería | GIF animado | Pokémon no encontrado |
| :---: | :---: | :---: |
| ![Galería](docs/evidencias/04-galeria.jpg) | ![GIF animado](docs/evidencias/05-gif-animado.jpg) | ![Error](docs/evidencias/06-no-encontrado.jpg) |

### Comparador y combate

| Selección de luchadores | Cuadro comparativo | Resultado del combate |
| :---: | :---: | :---: |
| ![Selección](docs/evidencias/07-seleccion-luchadores.jpg) | ![Comparativo](docs/evidencias/08-cuadro-comparativo.jpg) | ![Resultado](docs/evidencias/09-resultado-combate.jpg) |

---

## 9. Publicación en Android

| Elemento                | Valor / Ubicación                                                         |
| ----------------------- | ------------------------------------------------------------------------- |
| Identificador (`appId`) | `ec.edu.epn.pokeapp`                                                      |
| Nombre visible          | PokéAPP                                                                   |
| Versión                 | `1.0.0` (`versionCode 1`)                                                 |
| Permisos                | Solo `INTERNET`                                                           |
| Ícono y splash          | `resources/icon.png` y `resources/splash.png`                             |
| Política de privacidad  | [`PRIVACY.md`](./PRIVACY.md)                                              |
| Firma                   | `android/keystore.properties` + keystore `.jks` (ambos fuera del repositorio) |

---

## 10. Seguridad y Limitaciones

### Manejo de credenciales

- La app **no maneja secretos**: PokéAPI no usa claves y no hay servicios en la nube con credenciales.
- Lo único sensible son las **credenciales de firma de Android** (keystore y contraseñas). Se leen desde `android/keystore.properties`, que junto con `android/keystore/`, `*.jks`, `*.keystore` y `.env` está excluido en `.gitignore`. En el repositorio solo se publica la plantilla [`keystore.properties.example`](./android/keystore.properties.example) con valores de ejemplo.
- Perder el keystore impide publicar actualizaciones de la app con el mismo `appId`, así que se respalda fuera del repositorio.

### Privacidad

La app no recopila datos personales. Las consultas a PokéAPI solo envían el nombre o número del Pokémon buscado (ver [`PRIVACY.md`](./PRIVACY.md)).

### Limitaciones conocidas

- Requiere conexión a internet; no hay caché sin conexión.
- Depende de la disponibilidad de PokéAPI y de que cada Pokémon tenga sprites, GIF o grito disponibles (si faltan, se omiten).
- La simulación de combate es una fórmula ponderada de estadísticas base: no considera tipos, movimientos ni niveles.
- `pokemos-detail` es una página de plantilla sin contenido; el detalle se muestra dentro de la página principal.

---

## 11. Distribución del Trabajo

| Integrante           | Aportes                                                                                                                                                                                        |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Ganchala Eduardo** | Creación del proyecto, servicio inicial de PokéAPI, buscador, galería y simulación de combate, logo e íconos, configuración de publicación en Android (`appId`, recursos, firma) y política de privacidad. |
| **Ortiz Josué**      | Tipado del servicio y la página, galería ampliada con sprites animados y GIF/WebP, cuadro comparativo, configuración de ESLint, Prettier y pruebas, actualización de dependencias, integración de ambas versiones, manejo de credenciales y documentación. |
