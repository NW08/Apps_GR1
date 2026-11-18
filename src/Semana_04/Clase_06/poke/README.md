# PokéAPP || `SEMANA 04 - CLASE 06 (21|10|2026)`

> Pokédex en Ionic y Angular que consume la **PokéAPI**, personalizada, firmada y **publicada en Aptoide** como tienda de distribución alternativa a Google Play.

---

## 1. Descripción del Proyecto

Práctica **Parte 2: Publicación de la Pokédex** de la materia de Desarrollo de Aplicaciones Móviles. Toma como referencia el repositorio [jzaldumbide/pokedex-2026b](https://github.com/jzaldumbide/pokedex-2026b) y lo adapta a una versión propia. El objetivo no es solo construir la app, sino llevarla hasta una tienda real: personalizarla, configurar su identidad, generar un **APK firmado** (y su **AAB**), elegir una plataforma de distribución y completar el envío.

Alcance:

- La información, imágenes y sonidos se consultan en tiempo real a [PokéAPI](https://pokeapi.co/); la app no guarda datos del usuario.
- Se eligió **Aptoide**, que no exige pagar una cuenta de desarrollador y acepta APK firmados (ver [Plataforma de Distribución](#6-plataforma-de-distribución)).
- La investigación completa, la tabla comparativa y el procedimiento detallado se entregan en el **informe PDF**.

---

## 2. Integrantes

- **Ganchala Eduardo**
- **Ortiz Josué**

EPN · Periodo 2026B. Los aportes de cada uno están en [Distribución del Trabajo](#12-distribución-del-trabajo).

---

## 3. Requisitos y Cumplimiento

| #   | Requisito                                                        | Cumplimiento                                                                                                         |
| --- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| 1   | Versión propia en Ionic y Angular con componentes standalone     | Angular 22 standalone (sin `NgModule`), Ionic 9 y Capacitor 8; la Pokédex de referencia se amplió con multimedia y un comparador. |
| 2   | Consumir la API pública de Pokémon; listado y vista de detalles  | Servicio `Pokemon` sobre PokéAPI: listado inicial, buscador y detalle con tipos, estadísticas, descripción, galería y sonido. |
| 3   | Personalizar nombre, ícono y pantalla de inicio                  | Nombre **PokéAPP**, ícono y _splash_ propios generados desde `resources/` (ver [Personalización](#5-personalización-e-identidad)). |
| 4   | Identificador y versión; APK firmado y AAB                       | `ec.edu.epn.pokeapp`, versión `1.0.0` (`versionCode 1`); firma de release con keystore propio (ver [Compilación y Firma](#8-compilación-y-firma)). |
| 5   | Elegir una plataforma y completar el envío                       | App enviada a **Aptoide** mediante Aptoide Connect (ver [Estado de Publicación](#10-estado-de-publicación)).        |
| 6   | Documentar con capturas compilación, firma, carga y estado       | Capturas en [`docs/evidencias/`](./docs/evidencias/) (ver [Evidencias](#9-evidencias)).                              |

---

## 4. Funcionalidades y Tecnologías

### Funcionalidades de la app

| Sección               | Funcionalidad                                                                                                                         |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Listado               | Cuadrícula con los primeros 20 Pokémon (`/pokemon?limit=20`); tocar uno abre su detalle.                                              |
| Buscador              | `ion-searchbar` con _debounce_ de 700 ms; acepta nombre o número de Pokédex (ej. `pikachu` o `25`).                                   |
| Detalle               | Número, tipos, altura, peso, descripción de la especie (en español, con respaldo en inglés) y estadísticas base con `ion-progress-bar`. |
| Multimedia            | Grito oficial (`cries.latest`), galería de hasta 14 imágenes y alternador entre ilustración y GIF animado.                            |
| Comparar & Batalla    | Cuadro comparativo de dos Pokémon y simulación de combate con un poder ponderado de sus estadísticas.                                 |

### Tecnologías

| Tecnología                                         | Uso                                                              |
| -------------------------------------------------- | ---------------------------------------------------------------- |
| [Ionic 9](https://ionicframework.com/)             | Componentes de interfaz móvil                                    |
| [Angular 22](https://angular.dev/) (standalone, zoneless) | Componentes standalone, `HttpClient` y rutas diferidas    |
| [PokéAPI REST v2](https://pokeapi.co/docs/v2)      | Fuente de datos, imágenes y sonidos (pública, sin API key)       |
| [Capacitor 8](https://capacitorjs.com/)            | Proyecto nativo Android, ícono y _splash_                        |
| Android Studio · Gradle · `keytool`                | Compilación, firma del APK y generación del AAB                  |
| [Aptoide Connect](https://connect.aptoide.com/)    | Carga y publicación de la app en Aptoide                         |

---

## 5. Personalización e Identidad

| Elemento                 | Valor                         | Dónde se configura                                                                                      |
| ------------------------ | ----------------------------- | ------------------------------------------------------------------------------------------------------- |
| Nombre visible           | PokéAPP                       | `capacitor.config.ts` (`appName`) y `android/app/src/main/res/values/strings.xml`                       |
| Identificador            | `ec.edu.epn.pokeapp`          | `capacitor.config.ts` (`appId`) y `android/app/build.gradle` (`namespace`, `applicationId`)             |
| Versión                  | `1.0.0` · `versionCode 1`     | `android/app/build.gradle` (`versionName`, `versionCode`) y `package.json`                              |
| Ícono                    | Pokéball personalizada        | `resources/icon.png` → `android/app/src/main/res/mipmap-*`                                              |
| Pantalla de inicio       | _Splash_ personalizado        | `resources/splash.png` → `android/app/src/main/res/drawable*/splash.png`                                |
| Permisos                 | Solo `INTERNET`               | `android/app/src/main/AndroidManifest.xml`                                                              |
| Política de privacidad   | [`PRIVACY.md`](./PRIVACY.md)  | Requerida por la tienda; declara que la app no recopila datos personales                                |

El ícono y el _splash_ se regeneran a partir de `resources/` con:

```bash
npx @capacitor/assets generate --android
```

Para publicar una actualización, se incrementan **`versionCode`** (obligatorio, entero) y **`versionName`** en `android/app/build.gradle`.

---

## 6. Plataforma de Distribución

Resumen de las opciones evaluadas (el análisis completo está en el informe PDF):

| Plataforma                  | Costo para el desarrollador | Formato        | Consideraciones                                                                                 |
| --------------------------- | --------------------------- | -------------- | ----------------------------------------------------------------------------------------------- |
| Google Play                 | Pago único de 25 USD        | AAB            | Revisión de la app; las cuentas personales nuevas deben completar una prueba cerrada antes de producción. |
| **Aptoide** ✅              | Gratuito                    | APK firmado    | Carga desde Aptoide Connect, análisis de seguridad automático y enlace público de la app.       |
| F-Droid                     | Gratuito                    | Código fuente  | Solo apps de código abierto; F-Droid compila la app desde el repositorio, con un proceso más lento. |
| Huawei AppGallery           | Gratuito                    | APK / AAB      | Requiere verificación de identidad del desarrollador y revisión manual.                         |
| Distribución directa (GitHub Releases) | Gratuito         | APK firmado    | Sin revisión ni ficha de tienda; el usuario debe permitir la instalación de orígenes desconocidos. |

**Selección: Aptoide.** Cumple la consigna sin pagar una cuenta de desarrollador, acepta directamente el APK firmado, ofrece una ficha pública con enlace para compartir y realiza un análisis de seguridad del archivo, lo que acerca el proceso al de una tienda oficial.

---

## 7. Instalación y Ejecución

### Requisitos

| Herramienta                                            | Versión                                       |
| ------------------------------------------------------ | --------------------------------------------- |
| [Node.js](https://nodejs.org/) y npm                   | Node 22.22+, 24.15+ o 26+                     |
| [Ionic CLI](https://ionicframework.com/docs/intro/cli) | Global (`npm i -g @ionic/cli`) o `npx`        |
| [Android Studio](https://developer.android.com/studio) | Con Android SDK 36 y JDK 21 (incluido)        |

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

La app se abre en `http://localhost:8100/`. No requiere configuración adicional porque PokéAPI no usa claves.

3. **Sincronizar con Android**

```bash
npx ionic build
npx cap sync android
npx cap open android
```

La carpeta `android/` ya forma parte del repositorio (contiene la identidad y la configuración de firma), por lo que **no** se ejecuta `npx cap add android`.

Calidad de código: `npm run lint` (ESLint, tipos de e2e y Prettier) y `npm run test:unit` (Vitest).

---

## 8. Compilación y Firma

### 8.1 Crear el keystore (solo la primera vez)

```bash
mkdir -p android/keystore
keytool -genkeypair -v -keystore android/keystore/pokeapp-release.jks \
  -alias pokeapp -keyalg RSA -keysize 2048 -validity 10000
```

> **Importante:** el keystore y sus contraseñas **no se versionan**. Si se pierde, no se pueden publicar actualizaciones con el mismo identificador, así que se respalda fuera del repositorio.

### 8.2 Configurar las credenciales de firma

```bash
cp android/keystore.properties.example android/keystore.properties
```

Completa `android/keystore.properties` con la ruta (relativa a `android/app/`), el alias y las contraseñas. `android/app/build.gradle` lee este archivo y aplica la firma solo si existe, así que sin él el proyecto sigue compilando en modo debug.

### 8.3 Generar el APK firmado y el AAB

```bash
npx ionic build
npx cap sync android
cd android
./gradlew assembleRelease   # APK firmado → app/build/outputs/apk/release/app-release.apk
./gradlew bundleRelease     # AAB firmado → app/build/outputs/bundle/release/app-release.aab
```

_(En Windows: `gradlew.bat assembleRelease` y `gradlew.bat bundleRelease`. También se puede usar **Build > Generate Signed App Bundle / APK** en Android Studio.)_

### 8.4 Verificar la firma

```bash
apksigner verify --print-certs app/build/outputs/apk/release/app-release.apk
```

`apksigner` está en `Android/Sdk/build-tools/<versión>/`. Aptoide usa el **APK**; el **AAB** queda listo por si la app se publica después en Google Play.

### APK firmado

> [Descargar PokéAPP v1.0.0 (APK firmado)](PokeAPP-v1.0.0.apk)

---

## 9. Evidencias

Capturas sin datos sensibles (sin contraseñas ni rutas del keystore), guardadas en [`docs/evidencias/`](./docs/evidencias/).

### Aplicación personalizada

| Ícono en el launcher | Pantalla de inicio | Listado |
| :---: | :---: | :---: |
| ![Ícono](docs/evidencias/01-icono-launcher.jpg) | ![Splash](docs/evidencias/02-pantalla-inicio.jpg) | ![Listado](docs/evidencias/03-listado.jpg) |

| Detalle | Galería y GIF | Comparar & Batalla |
| :---: | :---: | :---: |
| ![Detalle](docs/evidencias/04-detalle.jpg) | ![Galería](docs/evidencias/05-galeria.jpg) | ![Batalla](docs/evidencias/06-batalla.jpg) |

### Compilación y firma

| Compilación | Firma (keystore) | APK y AAB generados | Verificación de firma |
| :---: | :---: | :---: | :---: |
| ![Compilación](docs/evidencias/07-compilacion.jpg) | ![Firma](docs/evidencias/08-firma.jpg) | ![APK y AAB](docs/evidencias/09-apk-aab-generados.jpg) | ![Verificación](docs/evidencias/10-verificacion-firma.jpg) |

### Carga y publicación en Aptoide

| Carga del APK | Ficha de la app | Estado de publicación | Instalación desde Aptoide |
| :---: | :---: | :---: | :---: |
| ![Carga](docs/evidencias/11-aptoide-carga.jpg) | ![Ficha](docs/evidencias/12-aptoide-ficha.jpg) | ![Estado](docs/evidencias/13-aptoide-estado.jpg) | ![Instalación](docs/evidencias/14-aptoide-instalacion.jpg) |

---

## 10. Estado de Publicación

| Campo                 | Valor                                     |
| --------------------- | ----------------------------------------- |
| Plataforma            | Aptoide                                   |
| Paquete               | `ec.edu.epn.pokeapp`                      |
| Versión enviada       | `1.0.0` (`versionCode 1`)                 |
| Estado                | Publicada                                 |
| Enlace público        | _(enlace de la ficha en Aptoide)_         |

Si una revisión queda pendiente o es rechazada, se documenta aquí el estado, el motivo indicado por la plataforma y las acciones correctivas aplicadas (por ejemplo, subir un nuevo APK con `versionCode` incrementado).

---

## 11. Seguridad y Limitaciones

### Manejo de credenciales

- La app **no maneja secretos**: PokéAPI no usa claves y no hay servicios en la nube con credenciales.
- Lo único sensible es la **firma de Android**. `android/keystore.properties`, `android/keystore/`, `*.jks`, `*.keystore` y `.env` están excluidos en `.gitignore`; en el repositorio solo se publica la plantilla [`keystore.properties.example`](./android/keystore.properties.example) con valores de ejemplo.

### Privacidad

La app no recopila datos personales. Las consultas a PokéAPI solo envían el nombre o número del Pokémon buscado (ver [`PRIVACY.md`](./PRIVACY.md)).

### Limitaciones conocidas

- Requiere conexión a internet; no hay caché sin conexión.
- Depende de la disponibilidad de PokéAPI y de que cada Pokémon tenga sprites, GIF o grito disponibles (si faltan, se omiten).
- La simulación de combate es una fórmula ponderada de estadísticas base: no considera tipos, movimientos ni niveles.
- Al instalar desde Aptoide, Android pide permitir la instalación desde esa tienda por ser un origen distinto a Google Play.

---

## 12. Distribución del Trabajo

| Integrante           | Aportes                                                                                                                                                                                        |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Ganchala Eduardo** | Creación del proyecto, servicio inicial de PokéAPI, buscador, galería y simulación de combate, personalización (nombre, ícono y _splash_), identificador, versión y configuración de firma en Android, y política de privacidad. |
| **Ortiz Josué**      | Tipado del servicio y la página, galería ampliada con sprites animados y GIF/WebP, cuadro comparativo, corrección de la detección de cambios zoneless, configuración de ESLint, Prettier y pruebas, integración de ambas versiones, manejo de credenciales y documentación. |
