# TalentFlow S.A. || `SEMANA 07 - CLASE 12 (11|11|2026)`

### Ganchala Eduardo & Ortiz Josué

> Construir una aplicación Ionic que permita registrar, validar, almacenar y consultar perfiles profesionales mediante formularios con diferentes componentes de Ionic y persistencia en Firebase Cloud Firestore.

---

## Contexto del Taller

El equipo fue contratado por **TalentFlow S.A.** para desarrollar un **prototipo funcional (MVP)** de registro de perfiles profesionales con **Ionic**, **Angular (Standalone Components)**, **Capacitor** y **Firebase Cloud Firestore**.

- **Sin autenticación:** el MVP no implementa inicio de sesión de usuarios.
- **Sin carga de archivos PDF:** la hoja de vida se registra mediante un **formulario digital**.
- **Referencia inicial:** el proyecto _Registro de estudiantes con Ionic y Firebase_ se usa como punto de partida conceptual para la conexión con Firestore, la creación de documentos y su consulta.
- **Adaptación al caso empresarial:** no basta con cambiar las etiquetas; el modelo de datos, los formularios y la interfaz se adaptan al nuevo caso de negocio.

---

## Cómo Instalar y Ejecutar

### Prerrequisitos

Antes de empezar, asegúrate de contar con el entorno base:

| Herramienta                                            | Versión recomendada                                       |
| ------------------------------------------------------ | --------------------------------------------------------- |
| [Node.js](https://nodejs.org/)                         | v20.x o LTS vigente                                       |
| [npm](https://www.npmjs.com/)                          | v10.x o superior                                          |
| [Ionic CLI](https://ionicframework.com/docs/intro/cli) | Incluido en dependencias o global (`npm i -g @ionic/cli`) |
| [Android Studio](https://developer.android.com/studio) | Para compilación y ejecución nativa en Android            |
| [Visual Studio Code](https://code.visualstudio.com/)   | Editor de código recomendado                              |

---

### Pasos

1. **Clona el repositorio y navega al directorio de la clase**

```bash
git clone https://github.com/NW08/Apps_GR1.git
cd Apps_GR1/src/Semana_07/Clase_12
```

_(o `cd src/Semana_07/Clase_12` si ya estás dentro del repositorio)_

> **Nota:** La aplicación `TalentFlow` también se mantiene en el repositorio compartido del equipo ([Eduxrd-o/TalentFlow](https://github.com/Eduxrd-o/TalentFlow)). En el repositorio general se integra mediante `git subtree`, por lo que sus archivos forman parte del repositorio y se sincronizan con:
>
> ```bash
> git remote add talentflow https://github.com/Eduxrd-o/TalentFlow.git   # solo la primera vez
> git subtree pull --prefix=src/Semana_07/Clase_12/TalentFlow talentflow main --squash
> git subtree push --prefix=src/Semana_07/Clase_12/TalentFlow talentflow main
> ```

2. **Instala las dependencias raíz de la clase**

```bash
npm install
```

3. **Ingresa a la carpeta `TalentFlow` e instala las dependencias de la aplicación**

```bash
cd TalentFlow
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
npx cap add android   # solo la primera vez (la carpeta android/ no se versiona)
npx cap sync android
npx cap open android
```

Una vez en Android Studio, ejecuta el proyecto en un emulador o dispositivo físico con depuración USB habilitada.

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
