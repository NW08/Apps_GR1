# Introducción Firebase || `SEMANA 06 - CLASE 10 (04|11|2026)`

Se realizó este proyecto como práctica introductoria a la integración de servicios en la nube en la materia de Desarrollo de Aplicaciones Móviles mediante **Ionic**, **Angular (Standalone Components)**, **Capacitor** y **Firebase**. En esta sesión se configuró la aplicación base **hello-firebase**, estableciendo la integración con **Firebase Hosting** para el despliegue web mediante la CLI de Firebase (`firebase-tools`), y preparando la base del proyecto móvil multiplataforma con Capacitor para compilación nativa en Android.

---

## Cómo Instalar y Ejecutar

### Prerrequisitos

Antes de empezar, asegúrate de contar con el entorno base:

| Herramienta                                            | Versión recomendada                                       |
| ------------------------------------------------------ | --------------------------------------------------------- |
| [Node.js](https://nodejs.org/)                         | v20.x o LTS vigente                                       |
| [npm](https://www.npmjs.com/)                          | v10.x o superior                                          |
| [Ionic CLI](https://ionicframework.com/docs/intro/cli) | Incluido en dependencias o global (`npm i -g @ionic/cli`) |
| [Firebase CLI](https://firebase.google.com/docs/cli)   | Incluido en dependencias o global (`firebase-tools`)      |
| [Android Studio](https://developer.android.com/studio) | Para compilación y ejecución nativa en Android            |
| [Visual Studio Code](https://code.visualstudio.com/)   | Editor de código recomendado                              |

---

### Pasos

1. **Clona el repositorio y navega al directorio de la clase**

```bash
git clone https://github.com/NW08/Apps_GR1.git
cd Apps_GR1/src/Semana_06/Clase_10
```

_(o `cd src/Semana_06/Clase_10` si ya estás dentro del repositorio)_

2. **Instala las dependencias raíz de la clase**

```bash
npm install
```

3. **Ingresa a la carpeta `hello-firebase` e instala las dependencias de la aplicación**

```bash
cd hello-firebase
npm install
```

4. **Ejecuta el servidor de desarrollo local en el navegador**

```bash
npx ionic serve
```

> **Nota:** Se utiliza `npx` para ejecutar Ionic CLI directamente desde las dependencias del proyecto o las instaladas en el sistema.

5. **Compila la aplicación para producción / Hosting**

```bash
npx ionic build
```

6. **Despliegue en Firebase Hosting**

Para desplegar los archivos generados en `www/` hacia el servicio en la nube:

```bash
npx firebase login
npx firebase deploy
```

7. **Compila y sincroniza con Android Studio (Nativo)**

Para sincronizar la compilación web hacia el proyecto nativo de Android:

```bash
npx ionic build
npx cap add android   # solo la primera vez (la carpeta android/ no se versiona)
npx cap sync android
npx cap open android
```

Una vez en Android Studio, ejecuta el proyecto en un emulador o dispositivo físico con depuración USB habilitada.

---

## Configuración de Firebase Hosting

El proyecto cuenta con las siguientes configuraciones para el despliegue automático en la nube:

- **`firebase.json`**: Define el directorio raíz para hosting (`www`), los patrones de exclusión (node_modules, archivos ocultos) y la regla de reescritura (_rewrites_) hacia `/index.html` para permitir el enrutamiento de aplicación de una sola página (SPA).
- **`.firebaserc`**: Vincula el proyecto local con el proyecto de Firebase en la nube (`testfb-123jss`).

---

## Vista General del Proyecto

| Componente / Archivo       | Responsabilidad                                                                                                    |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `home.page.*`              | Página principal de bienvenida con estructura de componentes Ionic (`IonHeader`, `IonToolbar`, `IonContent`).     |
| `app.component.*`          | Componente raíz de la aplicación con contenedor `IonApp` e `IonRouterOutlet`.                                      |
| `app.routes.ts`            | Configuración de rutas con carga diferida (`loadComponent`).                                                       |
| `capacitor.config.ts`      | Configuración de Capacitor con identificador `io.ionic.starter` y directorio web de salida `www`.                     |
| `firebase.json`            | Archivo de configuración de Firebase Hosting con soporte SPA.                                                      |
| `.firebaserc`              | Identificador del proyecto activo en Firebase (`testfb-123jss`).                                                   |
| `angular.json`             | Configuración de compilación, estilos globales, assets y builders de Angular.                                      |
| `eslint.config.js`         | Reglas de análisis estático de código para Angular y TypeScript.                                                   |
| `playwright.config.ts`     | Configuración de pruebas end-to-end (E2E).                                                                         |
| `vitest.config.mts`        | Configuración del entorno de pruebas unitarias con Vitest.                                                         |

---

## Calidad de Código y Linter

El proyecto incluye scripts configurados para análisis estático y formateo de código:

```bash
# Ejecutar verificación de linter, tipos y estilos Prettier
npm run lint

# Aplicar correcciones automáticas de eslint y formateo Prettier
npm run lint:fix
```

---

## Autor

Desarrollado por:

- **Ortiz Josué** · EPN · Periodo 2026B
