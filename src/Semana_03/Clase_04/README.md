# Galería de Fotos con Ionic & Capacitor || `SEMANA 03 - CLASE 04 (14|10|2026)`

Se realizó este proyecto como práctica formativa en la materia de Desarrollo de Aplicaciones Móviles mediante **Ionic Framework**, **Angular (Standalone Components)** y **Capacitor**, implementando una galería de fotos móvil interactiva con captura de imágenes mediante la cámara del dispositivo (`@capacitor/camera`), almacenamiento persistente en el sistema de archivos local (`@capacitor/filesystem`), guardado de metadatos con `@capacitor/preferences`, gestión reactiva de estado con **Angular Signals** (`signal<UserPhoto[]>`), soporte web y PWA con `@ionic/pwa-elements`, visualización en tiempo real dentro de la galería (`ion-grid`) y funcionalidades completas de eliminación de fotos tanto mediante un botón directo como a través del menú de confirmación `ActionSheetController`.

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
cd Apps_GR1/src/Semana_03/Clase_04
```

_(o `cd src/Semana_03/Clase_04` si ya estás dentro del repositorio)_

2. **Instala Ionic CLI (dependencias raíz de la clase)**

En la carpeta `src/Semana_03/Clase_04`, ejecuta la primera instalación para tener disponibles las herramientas CLI necesarias:

```bash
npm install
```

3. **Ingresa a la carpeta `photo-gallery` e instala las dependencias de la aplicación**

Entra al directorio del proyecto `photo-gallery` e instala Angular, Capacitor y los complementos requeridos:

```bash
cd photo-gallery
npm install
```

4. **Ejecuta el servidor de desarrollo local**

Dentro del directorio `photo-gallery`, inicia la aplicación:

```bash
ionic serve
```

> **Nota:** Si no tienes Ionic instalado de forma global en tu equipo, también puedes iniciar el servidor con `npx ionic serve`.

5. **Visualiza la aplicación**

- La aplicación se abrirá automáticamente en tu navegador en `http://localhost:8100/`.
- Presiona `F12` en el navegador y activa el modo dispositivo móvil (**Toggle Device Toolbar**) para probar la experiencia móvil.
- Para habilitar la captura de cámara en navegador web de escritorio, la aplicación inicializa automáticamente `@ionic/pwa-elements`.

---

## Vista General del Proyecto

Esta aplicación móvil implementa un flujo completo de captura, persistencia y gestión de fotografías organizado mediante pestañas de navegación (`tabs`):

| Componente / Archivo         | Responsabilidad                                                                                                                                                                                                                           |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `photo.service.ts`           | Servicio singleton (`PhotoService`) con Angular Signals (`photos`), captura con `Camera.getPhoto()`, conversión Base64, guardado persistente con `Filesystem.writeFile()`, lectura con `Filesystem.readFile()`, persistencia optimizada sin saturación de LocalStorage en `Preferences` y eliminación física del archivo con `Filesystem.deleteFile()`. |
| `tab1.page.ts / html / scss` | Vista de **Inicio** con tarjeta de bienvenida (`welcome-card`), descripción general del proyecto y botón de acceso directo a la galería (`/tabs/tab2`).                                                                                   |
| `tab2.page.ts / html / scss` | Vista de **Galería** con cuadrícula responsiva (`ion-grid`, `ion-row`, `ion-col`), visualización fluida de fotos con `ion-img`, botón flotante (`ion-fab`) para captura, visualización de estado vacío y doble mecanismo de eliminación de fotos (botón rápido `.delete-badge` y menú `ActionSheet`).                                |
| `tabs.page.ts / html / scss` | Contenedor de navegación por pestañas con barra inferior (`ion-tab-bar`) configurada con iconos para `Inicio` (`home`) y `Galería` (`camera-outline`).                                                                                     |
| `tabs.routes.ts`             | Enrutamiento principal con carga diferida (`loadComponent`) y redirección por defecto hacia la pestaña de inicio (`tab1`).                                                                                                               |
| `main.ts`                    | Inicialización standalone de Angular y registro de elementos web nativos con `defineCustomElements(window)` de `@ionic/pwa-elements/loader`.                                                                                              |
| `capacitor.config.ts`        | Configuración multiplataforma de Capacitor (`appId: 'io.ionic.starter'`, `appName: 'photo-gallery'`, `webDir: 'www'`).                                                                                                                   |
| `global.scss`                | Configuración de estilos globales y compatibilidad automática con el modo claro y oscuro del sistema.                                                                                                                                     |

---

## Características Implementadas

- **Captura fotográfica multiplataforma (`@capacitor/camera`):** Obtención de imágenes con la cámara del dispositivo o webcam en el navegador con máxima calidad (`quality: 100`, `CameraResultType.Uri`, `CameraSource.Camera`) y guardado en el carrete del sistema (`saveToGallery: true`).
- **Almacenamiento persistente en disco (`@capacitor/filesystem`):** Escritura física y lectura de las imágenes en formato Base64 dentro del directorio de datos del dispositivo (`Directory.Data`), asegurando que las fotografías permanezcan tras cerrar la aplicación.
- **Persistencia optimizada de metadatos con `@capacitor/preferences`:** Almacenamiento sincronizado del registro de fotografías serializado en JSON bajo la clave `photos`, previniendo desbordamientos de cuota de almacenamiento (`QuotaExceededError`) en entornos web.
- **Gestión reactiva de estado con Angular Signals:** Reactividad moderna y predecible mediante `signal<UserPhoto[]>([])` en `PhotoService` sin suscripciones manuales a observables.
- **Visualización dinámica en la galería:** Renderizado reactivo e inmediato de las fotografías en cuadrícula (`ion-grid`) con distribución fluida (2 columnas en smartphones, 3 en tablets y 4 en pantallas de mayor resolución), garantizando que las fotos capturadas y guardadas aparezcan correctamente.
- **Eliminación interactiva de fotos:** Las fotografías pueden eliminarse tanto pulsando el botón de papelera directo en cada tarjeta como seleccionando la foto para abrir el menú interactivo (`ActionSheetController`). La eliminación borra la foto reactivamente de la interfaz, sincroniza el almacenamiento de preferencias y elimina el archivo físico del disco (`Filesystem.deleteFile()`).
- **Manejo de estado vacío (Empty State):** Mensaje visual amigable con icono y llamado a la acción cuando la galería aún no tiene fotos registradas.
- **Soporte Web / PWA:** Carga de `@ionic/pwa-elements` en `main.ts` para posibilitar el uso de la cámara en entornos web sin requerir un dispositivo físico o emulador Android.
