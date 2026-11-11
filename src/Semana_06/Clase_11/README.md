# Firebase - APK Municipio || `SEMANA 06 - CLASE 11 (05|11|2026)`

Se realizó esta práctica en la materia de Desarrollo de Aplicaciones Móviles para llevar a producción la aplicación **UrbanInspect** (versión corregida de la [Clase 09](../../Semana_05/Clase_09/)) mediante **Firebase Hosting**, y para generar su **APK** de Android con **Capacitor**. El código de la aplicación es el mismo de la Clase 09. Lo nuevo de esta clase es la configuración de Firebase (`firebase.json`, `.firebaserc`) y el flujo de compilación y despliegue.

- **Hosting URL:** https://app-quito-prueba.web.app
- **Project Console:** https://console.firebase.google.com/project/app-quito-prueba/overview

---

## Cómo Instalar y Ejecutar

### Prerrequisitos

Antes de empezar, asegúrate de contar con el entorno base:

| Herramienta                                            | Versión recomendada                                       |
| ------------------------------------------------------ | --------------------------------------------------------- |
| [Node.js](https://nodejs.org/)                         | v20.x o LTS vigente                                       |
| [npm](https://www.npmjs.com/)                          | v10.x o superior                                          |
| [Ionic CLI](https://ionicframework.com/docs/intro/cli) | Incluido en dependencias o global (`npm i -g @ionic/cli`) |
| [Firebase CLI](https://firebase.google.com/docs/cli)   | Incluido en las dependencias de `municipio` (`firebase-tools`) |
| [Android Studio](https://developer.android.com/studio) | Para compilación y ejecución nativa en Android            |
| [Visual Studio Code](https://code.visualstudio.com/)   | Editor de código recomendado                              |

---

### Pasos

1. **Clona el repositorio y navega al directorio de la clase**

```bash
git clone https://github.com/NW08/Apps_GR1.git
cd Apps_GR1/src/Semana_06/Clase_11
```

_(o `cd src/Semana_06/Clase_11` si ya estás dentro del repositorio)_

2. **Instala las dependencias raíz de la clase**

```bash
npm install
```

3. **Ingresa a la carpeta `municipio` e instala las dependencias de la aplicación**

```bash
cd municipio
npm install
```

4. **Ejecuta el servidor de desarrollo local en el navegador**

```bash
npx ionic serve
```

5. **Compila la aplicación para producción**

```bash
npx ionic build
```

6. **Despliega en Firebase Hosting**

```bash
npx firebase login
npx firebase deploy --only hosting
```

> **Nota:** Se usa `npx` para ejecutar el `firebase-tools` local del proyecto, sin instalarlo de forma global.

7. **Compila y sincroniza con Android Studio (Nativo)**

```bash
npx ionic build
npx cap add android   # solo la primera vez (la carpeta android/ no se versiona)
npx cap sync android
npx cap open android
```

Una vez en Android Studio, ejecuta el proyecto en un emulador o dispositivo físico con depuración USB habilitada, o genera el APK desde **Build > Build APK(s)**.

---

## Configuración de Firebase Hosting

- **`firebase.json`**: publica el directorio `www` (la misma salida de `ng build` definida en `angular.json`), excluye archivos ocultos y `node_modules`, y reescribe todas las rutas hacia `/index.html` para que el enrutamiento de la SPA funcione al recargar la página.
- **`.firebaserc`**: vincula el proyecto local con el proyecto de Firebase `app-quito-prueba`.

> **Importante:** si se vuelve a ejecutar `npx firebase init hosting`, responde **No** a _"File www/index.html already exists. Overwrite?"_. Si respondes que sí, Firebase reemplaza el `index.html` de la app por su página de bienvenida y el sitio desplegado solo muestra la pantalla de _"Firebase Hosting Setup Complete"_. Si ya ocurrió, basta con volver a ejecutar `npx ionic build` antes del `deploy`.

---

## Vista General del Proyecto

| Componente / Archivo  | Responsabilidad                                                                       |
| --------------------- | ------------------------------------------------------------------------------------- |
| `municipio/src/`      | Código de UrbanInspect, igual al de la [Clase 09](../../Semana_05/Clase_09/).          |
| `firebase.json`       | Configuración de Firebase Hosting con directorio público `www` y soporte SPA.          |
| `.firebaserc`         | Proyecto activo en Firebase (`app-quito-prueba`).                                      |
| `angular.json`        | Salida de compilación en `www/`, el mismo directorio que publica Firebase.             |
| `capacitor.config.ts` | Configuración de Capacitor (`io.ionic.starter`) con directorio web `www`.              |
| `debug.apk`           | APK de depuración generado desde Android Studio.                                       |

---

## Autor

Desarrollado por:

- **Ortiz Josué** · EPN · Periodo 2026B
