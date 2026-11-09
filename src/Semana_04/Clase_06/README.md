# PokéAPP & Comparador Pokémon || `SEMANA 04 - CLASE 06 (21|10|2026)`

Se realizó este proyecto como práctica formativa en la materia de Desarrollo de Aplicaciones Móviles mediante **Ionic Framework** y **Angular (Standalone Components)**, implementando una aplicación móvil visualmente atractiva e interactiva que consume la **PokéAPI REST v2** para la búsqueda y visualización de personajes, reproducción de sonidos oficiales, renderizado de galerías multimedia y animaciones GIF, así como un módulo de comparación y simulación de combate entre 2 Pokémon.

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
cd Apps_GR1/src/Semana_04/Clase_06/poke
```

_(o `cd src/Semana_04/Clase_06/poke` si ya estás dentro del repositorio)_

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
- Puedes utilizar la consola de desarrollador (F12) en modo dispositivo móvil para disfrutar de la experiencia visual en formato smartphone o tablet.

---

## Vista General del Proyecto

| Componente / Archivo           | Responsabilidad                                                                                                                                                                                |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pokemon.ts`                   | Servicio injectable (`Pokemon`) que gestiona el consumo de PokéAPI: listados, detalles, descripciones por especie, extracción y ordenamiento de sprites de galería y reproducción de audio. |
| `home.page.ts / html / scss`   | Vista principal con interfaz segmentada: buscador reactivo, galería de imágenes interactiva, reproductor de grito, alternador de GIF/ilustración, cuadro comparativo y arena de simulación.  |
| `pokemos-detail.page.ts`       | Página de detalle secundaria configurada en el enrutamiento para navegaciones modales o directas.                                                                                              |
| `app.routes.ts`                | Configuración de rutas de Angular con soporte para carga diferida (`loadComponent`).                                                                                                         |
| `main.ts`                      | Configuración de arranque Standalone con `provideHttpClient()` y proveedores de Ionic Angular.                                                                                                |

---

## Niveles y Requerimientos Implementados

### Nivel 1 — Buscador y Detalles con Diseño Agradable

- **Buscador interactivo:** Permite encontrar cualquier Pokémon tanto por nombre como por número de ID oficial en la Pokédex.
- **Detalle completo:** Presenta el nombre, ID formateado, tipos con insignias de color, peso, altura, descripción narrativa de la especie (en español con respaldo en inglés) y barras de progreso reactivas para cada estadística base (HP, Ataque, Defensa, etc.) coloreadas según su magnitud.
- **Diseño visual:** Estilo Pokéball temático con encabezado estilizado en color rojo (`danger`), bordes redondeados, transiciones suaves y cuadrícula inicial de personajes sugeridos para consulta instantánea.

### Nivel 2 — Multimedia: Sonido, Galería y GIF Animado

- **Reproducción de sonido:** Botón para reproducir el grito sonoro característico del Pokémon en tiempo real mediante los recursos de audio oficial provistos por la PokéAPI (`cries.latest`).
- **Galería de más de 5 imágenes:** Colección interactiva de miniaturas que incluye arte oficial de alta resolución, versiones shiny (frente y espalda), modelos 3D de Pokémon HOME, sprites clásicos y versiones animadas de la Generación V y Showdown. Tocar cualquier miniatura actualiza la imagen principal en tamaño ampliado.
- **Visualizador de GIF/WebP:** Botón dedicado para alternar fluidamente entre la ilustración estática y la animación viva (GIF/WebP) proveniente de Pokémon Showdown.

### Nivel 3 — Comparador de 2 Personajes y Arena de Combate

- **Selección de contrincantes:** Búsqueda individual de dos Pokémon por nombre o ID, o selección con un toque mediante chips de sugerencias rápidas (Pikachu, Charizard, Blastoise, Gengar, Mewtwo, etc.).
- **Cuadro comparativo directo:** Tabla métrica que compara lado a lado HP, Ataque, Defensa, Ataque Especial, Defensa Especial, Velocidad, Poder Base Total, Peso y Altura, resaltando con distintivo verde cuál personaje lidera en cada característica.
- **Simulador de batalla:** Botón de combate que ejecuta una animación de enfrentamiento, calcula el desenlace considerando las fortalezas ofensivas y defensivas de ambos participantes, anuncia al vencedor y reproduce automáticamente su grito de victoria.

---

## Autor

Desarrollado por:

- **Ortiz Josué** · EPN · Periodo 2026B
