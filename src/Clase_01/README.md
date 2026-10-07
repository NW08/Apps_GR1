# CV con Ionic || `CLASE 01 (01|10|2026)`

Se realizó este proyecto como práctica formativa en la materia de Desarrollo de Aplicaciones Móviles mediante **Ionic** y **NodeJS**, estructurando una hoja de vida interactiva adaptable a dispositivos móviles.

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
cd Apps_GR1/src/Clase_01
```
*(o `cd src/Clase_01` si ya estás dentro del repositorio)*

2. **Instala Ionic CLI (dependencias raíz)**

En la carpeta raíz `Clase_01`, ejecuta la primera instalación para tener Ionic CLI disponible:

```bash
npm install
```

3. **Ingresa a la carpeta `CV` e instala las dependencias de la aplicación**

Entra al directorio del proyecto `CV` y vuelve a ejecutar la instalación para descargar Angular, Capacitor y los componentes de Ionic:

```bash
cd CV
npm install
```

4. **Ejecuta el servidor de desarrollo local**

Dentro del directorio `CV`, inicia la aplicación:

```bash
ionic serve
```

> **Nota:** Si no tienes Ionic instalado de forma global en tu equipo, también puedes iniciar el servidor con `npx ionic serve`.

5. **Visualiza la aplicación**

- La aplicación se abrirá automáticamente en tu navegador en `http://localhost:8100/`.
- Presiona `F12` en el navegador y activa el modo dispositivo móvil (**Toggle Device Toolbar**) para probar la experiencia móvil.

---

## Vista General del Proyecto

Esta aplicación móvil presenta un currículum vitae interactivo organizado en pestañas de navegación rápida, desarrollada con **Ionic Framework** y **Angular / TypeScript**. La arquitectura modular aprovecha el sistema de navegación por pestañas (`tabs`) para distribuir la información profesional:

| Módulo / Pestaña     | Responsabilidad                                                        |
| -------------------- | ---------------------------------------------------------------------- |
| `tab1 (Perfil)`      | Información personal, resumen profesional y contacto directo           |
| `tab2 (Experiencia)` | Historial laboral, roles desempeñados y proyectos destacados           |
| `tab3 (Educación)`   | Formación académica, cursos, certificaciones e idiomas                 |
| `tabs`               | Enrutamiento principal y contenedor de la barra de navegación inferior |
| `global.scss`        | Configuración visual global y personalización de temas (Light/Dark)    |

---

## Características Implementadas

- **Navegación por pestañas (Tabs):** Acceso fluido entre secciones sin recargar la vista mediante `@ionic/angular` routing.
- **Componentes Ionic nativos:** Uso de `ion-card`, `ion-avatar`, `ion-chip`, `ion-list` e `ion-badge` para estructurar la información con estética nativa móvil.
- **Acciones interactivas:** Botones integrados con esquemas directos (`mailto:`, `tel:`, `https://`) para enlaces a LinkedIn, GitHub y descarga de CV en PDF.
- **Diseño responsive:** Interfaz adaptable a pantallas de smartphones, tablets y navegador web.
- **Modo oscuro automático:** Soporte nativo para `prefers-color-scheme` mediante variables CSS de Ionic.
