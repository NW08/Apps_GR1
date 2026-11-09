# Geolocalización & GPS || `SEMANA 03 - CLASE 05 (15|10|2026)`

Se realizó este proyecto como práctica formativa en la materia de Desarrollo de Aplicaciones Móviles mediante **Ionic Framework** y **Angular (Standalone Components)**, implementando una aplicación minimalista y funcional de geolocalización que permite capturar la posición actual del usuario, generar hipervínculos dinámicos hacia **Google Maps** (tanto para la ubicación fija como para el cálculo de rutas hacia sitios de interés con puntos de paso intermedios) y exportar los datos en archivos de texto (`.txt`).

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

1. **Clona el repositorio y navega al directorio de la clase**

```bash
git clone https://github.com/NW08/Apps_GR1.git
cd Apps_GR1/src/Semana_03/Clase_05
```

_(o `cd src/Semana_03/Clase_05` si ya estás dentro del repositorio)_

2. **Ingresa a la carpeta `gps` e instala las dependencias de la aplicación**

```bash
cd gps
npm install
```

3. **Ejecuta el servidor de desarrollo local**

```bash
ionic serve
```

> **Nota:** Si no tienes Ionic instalado de forma global en tu equipo, también puedes iniciar el servidor con `npx ionic serve`.

4. **Visualiza la aplicación**

- La aplicación se abrirá automáticamente en tu navegador en `http://localhost:8100/`.
- Permite el acceso a la ubicación cuando el navegador lo solicite para obtener tus coordenadas GPS reales.

---

## Vista General del Proyecto

| Componente / Archivo         | Responsabilidad                                                                                                                                                    |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `location.ts`                | Servicio injectable (`LocationService`) que interactúa con la API estándar de geolocalización (`navigator.geolocation`) de forma nativa sin sobreingeniería.       |
| `home.page.ts / html / scss` | Vista principal con diseño minimalista, cálculo reactivo de URLs de Google Maps, selectores de rutas a sitios de interés y generadores de descarga de reportes `.txt`. |
| `app.routes.ts`              | Enrutamiento principal con redirección por defecto a `/home`.                                                                                                      |

---

## Requerimientos y Funcionalidades

1. **Hipervínculo a la posición GPS actual:**
   - Detección reactiva de coordenadas de latitud y longitud.
   - Generación de hipervínculo directo hacia Google Maps con el formato:
     `https://www.google.com/maps/@{LAT},{LNG}` (ej. `https://www.google.com/maps/@-0.2025464,-78.4941719`).

2. **Hipervínculo de ruta a sitios de interés:**
   - Selección de rutas hacia casa, parques (ej. Parque La Carolina) o sitios de interés (ej. El Panecillo), con opción de usar la ubicación actual o manual como punto de origen.
   - Generación del hipervínculo estructurado de direcciones en Google Maps incluyendo destino y waypoints codificados:
     `https://www.google.com/maps/dir/?api=1&origin={LAT,LNG}&destination={LAT,LNG}&waypoints={LAT,LNG}%7C{LAT,LNG}`.

3. **Guardar ubicación en archivo TXT:**
   - Botón directo que genera y descarga el archivo `ubicacion_gps.txt` con las coordenadas y el enlace hacia Google Maps.

4. **Guardar ruta en archivo TXT:**
   - Botón directo que genera y descarga el archivo `ruta_gps.txt` con los puntos de origen, destino, waypoints y el enlace de la ruta hacia Google Maps.

5. **Diseño de Interfaz Minimalista:**
   - Estética limpia y funcional en tonos neutros y monocromáticos, eliminando gradientes pesados, sombras excesivas y saturación visual innecesaria.
