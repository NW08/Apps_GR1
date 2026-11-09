# API Explorer || `SEMANA 04 - CLASE 07 (22|10|2026)`

Se realizó este proyecto como reto práctico en la materia de Desarrollo de Aplicaciones Móviles mediante **Ionic Framework**, **Angular (Standalone Components)** y **Capacitor**, implementando una aplicación móvil que explora el catálogo de libros de la **API pública de Open Library**. La aplicación integra un listado remoto con tarjetas, búsqueda con filtros de ordenamiento, carga incremental mediante `ion-infinite-scroll`, vista de detalle por parámetro de ruta, manejo de estados de carga/vacío/error con reintento y favoritos persistentes en el dispositivo.

---

## Cómo Instalar y Ejecutar

### Prerrequisitos

Antes de empezar, asegúrate de contar con el entorno base:

| Herramienta                                            | Versión recomendada                                       |
| ------------------------------------------------------ | --------------------------------------------------------- |
| [Node.js](https://nodejs.org/)                         | v20.x o LTS vigente                                       |
| [npm](https://www.npmjs.com/)                          | v10.x o superior                                          |
| [Ionic CLI](https://ionicframework.com/docs/intro/cli) | Incluido en dependencias o global (`npm i -g @ionic/cli`) |
| [Visual Studio Code](https://code.visualstudio.com/)   | Editor de código recomendado                              |

---

### Pasos

1. **Clona el repositorio y navega al directorio del proyecto**

```bash
git clone https://github.com/NW08/Apps_GR1.git
cd Apps_GR1/src/Semana_04/Clase_07/explorer
```

_(o `cd src/Semana_04/Clase_07/explorer` si ya estás dentro del repositorio)_

2. **Instala las dependencias de la aplicación**

```bash
npm install
```

3. **Ejecuta el servidor de desarrollo local**

```bash
ionic serve
```

> **Nota:** Si no tienes el Ionic CLI instalado de forma global, puedes ejecutar el servidor directamente con `npx ionic serve` o con `npm start`.

4. **Visualiza la aplicación**

- La aplicación se abrirá automáticamente en tu navegador en `http://localhost:8100/`.
- Puedes utilizar la consola de desarrollador (F12) en modo dispositivo móvil para visualizarla en formato smartphone.

---

## API y Endpoints

Se eligió **[Open Library](https://openlibrary.org/developers/api)**: no requiere clave, permite CORS y soporta paginación nativa por `page` / `limit`.

| Uso               | Endpoint                                                                 |
| ----------------- | ------------------------------------------------------------------------ |
| Búsqueda paginada | `GET https://openlibrary.org/search.json?q={texto}&page={n}&limit=20&sort={new\|old}` |
| Detalle de obra   | `GET https://openlibrary.org/works/{id}.json`                            |
| Nombre de autor   | `GET https://openlibrary.org/authors/{id}.json`                          |
| Portadas          | `https://covers.openlibrary.org/b/id/{cover_i}-{M\|L}.jpg`               |

> En la búsqueda se envía `fields=key,title,author_name,first_publish_year,cover_i,edition_count` para reducir el tamaño de la respuesta.

---

## Vista General del Proyecto

| Componente / Archivo              | Responsabilidad                                                                                                                       |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `models/book.ts`                  | Interfaces TypeScript del dominio (`Book`, `BookDetail`, `BookPage`) y de las respuestas crudas de Open Library.                     |
| `services/books.service.ts`       | Servicio HTTP: búsqueda paginada, detalle de obra con autores (`forkJoin`) y construcción de URLs de portada.                         |
| `services/favorites.service.ts`   | Estado de favoritos con `signal` y persistencia local en `localStorage`.                                                              |
| `components/book-card/`           | Tarjeta reutilizable con portada, título, autores, año, ediciones y botón de favorito.                                                |
| `home/home.page.*`                | Listado principal: `ion-searchbar`, filtro de orden (`ion-segment`), `ion-infinite-scroll`, `ion-refresher` y estados de la interfaz. |
| `pages/book-detail/`              | Detalle por parámetro de ruta `book/:id` (recibido como `input()` gracias a `withComponentInputBinding`).                            |
| `pages/favorites/`                | Listado de libros guardados como favoritos.                                                                                           |
| `app.routes.ts`                   | Rutas con carga diferida (`loadComponent`): `home`, `book/:id`, `favorites`.                                                          |

---

## Requerimientos Implementados

- **R1 — Listado remoto:** Tarjetas con datos reales (portada, título, autores, año de publicación y número de ediciones).
- **R2 — Infinite scrolling:** `ion-infinite-scroll` solicita la página siguiente, anexa resultados filtrando duplicados por `id`, llama a `complete()` siempre (incluso ante error) y se deshabilita al agotarse los registros.
- **R3 — Búsqueda y filtros:** `ion-searchbar` con `debounce` de 500 ms y filtro de orden (Relevancia, Recientes, Antiguos). Cada cambio limpia la lista y reinicia la paginación.
- **R4 — Detalle y rutas:** Navegación a `book/:id` con descripción, autores, temas y enlace a Open Library; regreso con `ion-back-button`.
- **R5 — Estados y errores:** Spinner de carga, lista vacía ("sin resultados"), error de red con botón **Reintentar** y error al cargar páginas siguientes sin perder la lista ya cargada.
- **R6 — Favoritos persistentes:** Agregar/quitar desde la tarjeta o el detalle; se conservan al recargar la app.
- **R7 — Estructura de código:** Servicio HTTP, interfaces TypeScript, componente de tarjeta y páginas separadas.
- **Extensión opcional:** Pull-to-refresh con `ion-refresher`.

---

## Decisiones de Paginación

- **Estado mantenido:** `page`, `loading`, `hasMore`, `error`, `total` y la lista acumulada `books` (signals).
- **Sin solicitudes simultáneas:** `fetch()` no se ejecuta si ya hay una petición en curso (`loading`) o si no quedan resultados (`hasMore`).
- **Fin del listado:** `hasMore = página * limit < numFound`; al ser falso, el infinite scroll queda deshabilitado y se muestra "No hay más resultados".
- **Nueva búsqueda:** se cancela la suscripción anterior (`unsubscribe`) para no mezclar respuestas antiguas, se vacía la lista y se vuelve a `page = 1`.
- **Error en una página intermedia:** no se avanza el número de página; el usuario reintenta la misma página y la lista ya cargada se conserva.

---

## Dificultades

- Open Library exige siempre un parámetro `q`, por lo que con el buscador vacío se usa la consulta por defecto `fantasy`.
- La descripción de una obra puede llegar como texto o como objeto `{ value }`, y algunas obras no tienen portada ni autores; el servicio normaliza estos casos.
- Para la persistencia se usó `localStorage` (equivalente a Capacitor Preferences y funcional en el WebView de Android) para no añadir un plugin adicional.

---

## Autor

Desarrollado por:

- **Ortiz Josué** · EPN · Periodo 2026B
