# PokéAPP - Publicación en Aptoide || `SEMANA 04 - CLASE 06 (21|10|2026)`

### Ganchala Eduardo & Ortiz Josué

Se realizó esta práctica en la materia de Desarrollo de Aplicaciones Móviles como **Parte 2: Publicación de la Pokédex**. A partir del repositorio de referencia [jzaldumbide/pokedex-2026b](https://github.com/jzaldumbide/pokedex-2026b) se desarrolló una versión propia con **Ionic**, **Angular (Standalone Components)** y **Capacitor**. La app consume la **PokéAPI** (listado, búsqueda, detalle, multimedia y comparador de combate), se personalizó con nombre, ícono y pantalla de inicio propios, se configuró su identificador y versión, se generó su **APK firmado** y **AAB**, y finalmente se **envió a Aptoide** como tienda alternativa a Google Play, donde la versión `1.0.0` está **pendiente de revisión**.

La documentación completa de la publicación (requisitos, comparativa de plataformas, compilación, firma, evidencias y estado) está en el [README de la aplicación](./poke/README.md).

---

## Cómo Instalar y Ejecutar

### Prerrequisitos

Antes de empezar, asegúrate de contar con el entorno base:

| Herramienta                                            | Versión recomendada                                       |
| ------------------------------------------------------ | --------------------------------------------------------- |
| [Node.js](https://nodejs.org/)                         | v22.x o LTS vigente                                       |
| [npm](https://www.npmjs.com/)                          | v10.x o superior                                          |
| [Ionic CLI](https://ionicframework.com/docs/intro/cli) | Incluido en dependencias o global (`npm i -g @ionic/cli`) |
| [Android Studio](https://developer.android.com/studio) | Para compilación, firma y generación del APK/AAB          |
| [Visual Studio Code](https://code.visualstudio.com/)   | Editor de código recomendado                              |

---

### Pasos

1. **Clona el repositorio y navega al directorio de la clase**

```bash
git clone https://github.com/NW08/Apps_GR1.git
cd Apps_GR1/src/Semana_04/Clase_06
```

_(o `cd src/Semana_04/Clase_06` si ya estás dentro del repositorio)_

> **Nota:** La aplicación `poke` también se mantiene en el repositorio compartido del equipo ([Eduxrd-o/PokeAPP](https://github.com/Eduxrd-o/PokeAPP)). En el repositorio general se integra mediante `git subtree`, por lo que sus archivos forman parte del repositorio y se sincronizan con:
>
> ```bash
> git remote add poke git@github.com:Eduxrd-o/PokeAPP.git   # solo la primera vez
> git subtree pull --prefix=src/Semana_04/Clase_06/poke poke master --squash
> git subtree push --prefix=src/Semana_04/Clase_06/poke poke master
> ```

2. **Instala las dependencias raíz de la clase**

```bash
npm install
```

3. **Ingresa a la carpeta `poke` e instala las dependencias de la aplicación**

```bash
cd poke
npm install
```

4. **Ejecuta el servidor de desarrollo local en el navegador**

```bash
npx ionic serve
```

> **Nota:** Se utiliza `npx` para ejecutar Ionic CLI directamente desde las dependencias del proyecto o las instaladas en el sistema.

5. **Compila y sincroniza con Android Studio (Nativo)**

```bash
npx ionic build
npx cap sync android
npx cap open android
```

La carpeta `android/` sí se versiona en este proyecto, porque contiene la identidad de la app (`ec.edu.epn.pokeapp`), el ícono, la pantalla de inicio y la configuración de firma. Por eso **no** se ejecuta `npx cap add android`.

6. **Genera el APK firmado y el AAB**

```bash
cp android/keystore.properties.example android/keystore.properties   # completar con los datos del keystore
cd android
./gradlew assembleRelease   # APK firmado
./gradlew bundleRelease     # AAB firmado
```

> **Importante:** el keystore (`.jks`) y `keystore.properties` nunca se suben al repositorio; ambos están excluidos en `.gitignore`.

Los artefactos firmados de la versión `1.0.0` ya están listos en la carpeta de la app: [`PokeAPP-v1.0.0.apk`](./poke/PokeAPP-v1.0.0.apk) y [`PokeAPP-v1.0.0.aab`](./poke/PokeAPP-v1.0.0.aab).

---

## Publicación en Aptoide

| Paso                     | Detalle                                                                                                 |
| ------------------------ | ------------------------------------------------------------------------------------------------------- |
| Selección de plataforma  | Aptoide: registro y carga gratuitos, acepta APK firmados y genera un enlace público al aprobarse (Google Play exige un pago de 25 USD y AAB). |
| Personalización          | Nombre **PokéAPP**, ícono y _splash_ generados desde `poke/resources/` con `@capacitor/assets`.          |
| Identidad                | `appId` `ec.edu.epn.pokeapp`, versión `1.0.0` (`versionCode 1`).                                         |
| Firma                    | Keystore propio con `keytool`; credenciales leídas desde `android/keystore.properties`.                  |
| Envío                    | Carga del APK firmado en Aptoide Connect, con ficha, capturas y [política de privacidad](./poke/PRIVACY.md). |
| Estado                   | **Pendiente.** La _solicitud de propiedad_ del paquete solo se revisa con una suscripción activa en Aptoide Connect, así que aún no hay enlace público. |
| Evidencias               | 13 capturas de la app, compilación, configuración de firma, carga y estado en [`poke/docs/evidencias/`](./poke/docs/evidencias/). |

---

## Vista General del Proyecto

| Componente / Archivo                         | Responsabilidad                                                                                           |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `poke/src/app/services/pokemon.ts`           | Servicio que consume PokéAPI: listado, detalle, especie, galería de sprites y reproducción de sonidos.    |
| `poke/src/app/home/home.page.*`              | Pokédex (listado, buscador, detalle y multimedia) y sección **Comparar & Batalla**.                       |
| `poke/capacitor.config.ts`                   | Identificador `ec.edu.epn.pokeapp` y nombre visible **PokéAPP**.                                          |
| `poke/android/app/build.gradle`              | Versión (`versionName`, `versionCode`) y configuración de firma de release.                               |
| `poke/android/keystore.properties.example`   | Plantilla de credenciales de firma (el archivo real no se versiona).                                      |
| `poke/resources/`                            | Ícono y pantalla de inicio fuente para generar los recursos de Android.                                   |
| `poke/PRIVACY.md`                            | Política de privacidad requerida para la publicación.                                                     |
| `poke/PokeAPP-v1.0.0.apk` / `.aab`           | APK y AAB firmados de la versión `1.0.0`.                                                                  |
| `poke/README.md`                             | Documentación del repositorio compartido: requisitos, publicación, evidencias y estado.                   |

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

## Autores

Desarrollado por:

- **Ganchala Eduardo** · EPN · Periodo 2026B
- **Ortiz Josué** · EPN · Periodo 2026B
