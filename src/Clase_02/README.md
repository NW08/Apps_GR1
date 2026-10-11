# Ionic & Android Studio || `CLASE 02 (07|10|2026)`

Se realizó este proyecto como práctica formativa en la materia de Desarrollo de Aplicaciones Móviles mediante **Ionic**, **Angular** y **Capacitor**, implementando una aplicación interactiva para el cálculo simultáneo de múltiplos (2, 3, 5, 7 y 10) y la generación secuencial de números primos con historial dinámico y función de reinicio, adaptable a dispositivos móviles.

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
cd Apps_GR1/src/Clase_02
```

*(o `cd src/Clase_02` si ya estás dentro del repositorio)*

2. **Instala Ionic CLI (dependencias raíz)**

En la carpeta raíz `Clase_02`, ejecuta la primera instalación para tener Ionic CLI disponible:

```bash
npm install
```

3. **Ingresa a la carpeta `multiplos` e instala las dependencias de la aplicación**

Entra al directorio del proyecto `multiplos` y vuelve a ejecutar la instalación para descargar Angular, Capacitor y los componentes de Ionic:

```bash
cd multiplos
npm install
```

4. **Ejecuta el servidor de desarrollo local**

Dentro del directorio `multiplos`, inicia la aplicación:

```bash
ionic serve
```

> **Nota:** Si no tienes Ionic instalado de forma global en tu equipo, también puedes iniciar el servidor con `npx ionic serve`.

5. **Visualiza la aplicación**

- La aplicación se abrirá automáticamente en tu navegador en `http://localhost:8100/`.
- Presiona `F12` en el navegador y activa el modo dispositivo móvil (**Toggle Device Toolbar**) para probar la experiencia móvil.

---

## Vista General del Proyecto

Esta aplicación móvil presenta una interfaz interactiva desarrollada con **Ionic Framework** y **Angular (Standalone Components) / TypeScript**. La arquitectura está estructurada en torno a una vista principal que gestiona el cálculo numérico, la lista de historial de primos y la presentación reactiva de los resultados:

| Componente / Archivo | Responsabilidad                                                                                                                      |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `home.page.ts`       | Lógica de cálculo: métodos `multiples()` (múltiplos de 2, 3, 5, 7 y 10), `logic()` (detección de primos) y gestión del arreglo `numbers` |
| `home.page.html`     | Estructura visual con barra de título (`ion-toolbar`), secciones por múltiplo, contenedor de historial de primos (`*ngFor`) y botones de acción |
| `home.page.scss`     | Diseño visual personalizado: contenedor con sombra, insignias para el historial numérico (`.numbers span`) y respuesta táctil en botones |
| `app.routes.ts`      | Configuración de enrutamiento principal y redirección hacia la vista `home`                                                          |
| `global.scss`        | Configuración visual global y soporte para modo oscuro automático del sistema                                                        |

---

## Características Implementadas

- **Cálculo dinámico de múltiplos:** Generación secuencial de múltiplos de 2, 3, 5, 7 y 10 al pulsar el botón "Generar", incrementando a partir de los valores previos calculados.
- **Generación y cola de números primos:** Algoritmo que comprueba la primalidad (`logic()`) y acumula los últimos 5 números primos en una lista deslizante mediante `shift()` y `push()`.
- **Función de reinicio total:** Restablecimiento instantáneo de todos los múltiplos a cero, vaciado del historial de números primos y reseteo de variables de estado con el botón "Reiniciar".
- **Componentes Standalone y Directivas Angular:** Estructura modular basada en componentes standalone con integración de `CommonModule` para el renderizado dinámico mediante `*ngFor` y componentes UI de `@ionic/angular`.
- **Diseño de interfaz con insignias numéricas:** Presentación organizada en tarjeta centralizada, etiquetas tipo insignia (`badges`) para la lista de primos generados y microinteracciones táctiles (`transform: scale`) en botones.
- **Modo oscuro automático:** Soporte nativo para `prefers-color-scheme` mediante variables CSS y paleta del sistema de Ionic (`dark.system.css`).
