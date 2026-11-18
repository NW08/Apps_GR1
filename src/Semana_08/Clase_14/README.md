# novaSync - Supabase & Firebase || `SEMANA 08 - CLASE 14 (18|11|2026)`

### Ganchala Eduardo & Ortiz Josué

> Construir una aplicación Ionic de mensajería en tiempo real que integre Supabase y Firebase de forma complementaria, con funciones nativas del dispositivo y sin publicar credenciales en el repositorio.

---

## Contexto del Taller

El equipo desarrolló **novaSync**, una app de chat con salas públicas y privadas construida con **Ionic**, **Angular (Standalone Components)** y **Capacitor**, que usa **dos backends al mismo tiempo**:

- **Supabase:** autenticación, base de datos PostgreSQL con políticas RLS, mensajes en tiempo real (Realtime), archivos (Storage) y códigos de invitación `NOVA-XXXX` mediante una función RPC.
- **Firebase Realtime Database:** estado efímero que cambia cada segundo: presencia en línea, indicador de _"escribiendo..."_ y ubicación GPS en vivo, limpiados automáticamente con `onDisconnect()`.
- **Funciones nativas:** cámara para avatares e imágenes, geolocalización para compartir ubicación y vibración al interactuar.
- **Credenciales fuera del código:** las claves de ambos servicios viven en un archivo `.env` que no se versiona; la configuración se genera al ejecutar la app.

La documentación completa (funcionalidades, arquitectura, uso de cada motor, modelo de datos, evidencias y seguridad) está en el [README de la aplicación](./nova/README.md).

---

## Cómo Instalar y Ejecutar

### Prerrequisitos

Antes de empezar, asegúrate de contar con el entorno base:

| Herramienta                                                  | Versión recomendada                                       |
| ------------------------------------------------------------ | --------------------------------------------------------- |
| [Node.js](https://nodejs.org/)                               | v22.x o LTS vigente actual                                |
| [npm](https://www.npmjs.com/)                                | v10.x o superior                                          |
| [Ionic CLI](https://ionicframework.com/docs/intro/cli)       | Incluido en dependencias o global (`npm i -g @ionic/cli`) |
| Proyecto de [Supabase](https://supabase.com/)                | Plan gratuito                                             |
| Proyecto de [Firebase](https://console.firebase.google.com/) | Con **Realtime Database** habilitado                      |
| [Android Studio](https://developer.android.com/studio)       | Para compilación y ejecución nativa en Android            |
| [Visual Studio Code](https://code.visualstudio.com/)         | Editor de código recomendado                              |

---

### Pasos

1. **Clona el repositorio y navega al directorio de la clase**

```bash
git clone https://github.com/NW08/Apps_GR1.git
cd Apps_GR1/src/Semana_08/Clase_14
```

_(o `cd src/Semana_08/Clase_14` si ya estás dentro del repositorio)_

> **Nota:** La aplicación `nova` también se mantiene en el repositorio compartido del equipo ([Eduxrd-o/novaSync](https://github.com/Eduxrd-o/novaSync)). En el repositorio general se integra mediante `git subtree`, por lo que sus archivos forman parte del repositorio y se sincronizan con:
>
> ```bash
> git remote add nova git@github.com:Eduxrd-o/novaSync.git   # solo la primera vez
> git subtree pull --prefix=src/Semana_08/Clase_14/nova nova master --squash
> git subtree push --prefix=src/Semana_08/Clase_14/nova nova master
> ```

2. **Ingresa a la carpeta `nova` e instala las dependencias de la aplicación**

```bash
cd nova
npm install
```

3. **Configura Supabase y Firebase**

- En Supabase, ejecuta [`nova/supabase/schema.sql`](./nova/supabase/schema.sql) desde el **SQL Editor**.
- En Firebase, habilita **Realtime Database** y publica las reglas de [`nova/firebase/database.rules.json`](./nova/firebase/database.rules.json).

4. **Crea el archivo `.env` con las credenciales**

```bash
cp .env.example .env
```

Completa la URL y la clave **anon** de Supabase, y la configuración de la app web de Firebase (incluida `FIREBASE_DATABASE_URL`). El archivo `src/environments/env.config.ts` se genera automáticamente desde `.env` al ejecutar la app (manualmente: `npm run env`).

> **Importante:** `.env` y `env.config.ts` nunca se suben al repositorio; ambos están excluidos en `.gitignore`. Nunca uses la clave `service_role` de Supabase en la app.

5. **Ejecuta el servidor de desarrollo local en el navegador**

```bash
npx ionic serve
```

> **Nota:** Se utiliza `npx` para ejecutar Ionic CLI directamente desde las dependencias del proyecto o las instaladas en el sistema.

6. **Compila y sincroniza con Android Studio (Nativo)**

```bash
npx ionic build
npx cap add android   # solo la primera vez (la carpeta android/ no se versiona)
npx cap sync android
npx cap open android
```

Agrega los permisos `CAMERA`, `ACCESS_COARSE_LOCATION` y `ACCESS_FINE_LOCATION` en el `AndroidManifest.xml` y ejecuta el proyecto en un emulador o dispositivo físico con depuración USB habilitada.

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
