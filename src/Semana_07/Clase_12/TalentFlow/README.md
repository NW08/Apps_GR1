# TalentFlow S.A. || `SEMANA 07 - CLASE 12 (11|11|2026)`

### Ganchala Eduardo & Ortiz Josué

> Aplicación móvil Ionic para **registrar, validar, almacenar y consultar perfiles profesionales** de postulantes, con persistencia en **Firebase Cloud Firestore**.

---

## Tabla de Contenidos

1. [Problema Empresarial](#1-problema-empresarial)
2. [Integrantes](#2-integrantes)
3. [Objetivo y Funcionalidades](#3-objetivo-y-funcionalidades)
4. [Tecnologías y Componentes Ionic](#4-tecnologías-y-componentes-ionic)
5. [Arquitectura](#5-arquitectura)
6. [Modelo de Datos](#6-modelo-de-datos)
7. [Instalación y Ejecución](#7-instalación-y-ejecución)
8. [Evidencias](#8-evidencias)
9. [Pruebas](#9-pruebas)
10. [Seguridad y Limitaciones](#10-seguridad-y-limitaciones)
11. [Distribución del Trabajo](#11-distribución-del-trabajo)

---

## 1. Problema Empresarial

La empresa ficticia **TalentFlow S.A.** recibe hojas de vida por correo electrónico y tiene dificultades para organizar los perfiles de los candidatos. El equipo de Talento Humano necesita una **aplicación móvil de registro de postulantes** que capture información estructurada y la almacene en la nube para consultarla posteriormente.

Este proyecto es un **prototipo funcional (MVP)**:

- **Sin autenticación:** el MVP no implementa inicio de sesión de usuarios.
- **Sin carga de archivos PDF:** la hoja de vida se registra mediante un **formulario digital**.
- **Punto de partida:** el ejemplo _Registro de estudiantes con Ionic y Firebase_ se tomó como referencia conceptual para la conexión con Firestore; el modelo de datos, los formularios y la interfaz se rediseñaron para el caso de reclutamiento.
- **Datos ficticios:** toda la información registrada es de prueba.

---

## 2. Integrantes

| Integrante           | Rol en el proyecto                                          |
| -------------------- | ----------------------------------------------------------- |
| **Ganchala Eduardo** | Configuración de Firebase, modelo de datos y diseño de UI   |
| **Ortiz Josué**      | Validaciones, edición/ordenamiento, seguridad y documentación |

> El detalle de los aportes está en [Distribución del Trabajo](#11-distribución-del-trabajo).

---

## 3. Objetivo y Funcionalidades

### Objetivo

Construir una aplicación Ionic que permita **registrar, validar, almacenar y consultar perfiles profesionales** mediante formularios con diferentes componentes de Ionic y persistencia en **Firebase Cloud Firestore**.

### Funcionalidades obligatorias

| Funcionalidad                               | Implementación                                                                                                                        |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Registrar candidato                         | Pestaña **Postular**: formulario en 4 bloques (`ion-card`) con validaciones y mensajes de error junto a cada campo.                   |
| Guardar como nuevo documento                | `addDoc()` en la colección `candidatos`; cada campo se guarda como atributo consultable del documento.                               |
| Marca temporal de creación                  | Campo `creadoEn` con `serverTimestamp()`.                                                                                             |
| Validar antes de enviar                     | Formulario reactivo tipado: si es inválido se marcan todos los campos, se muestra un toast de error y **no** se llama a Firestore. |
| Indicador de carga                          | `ion-spinner` en el botón de guardado, al cargar el listado y al cargar un perfil para edición.                                      |
| Mensajes de éxito y error                   | `ion-toast` (vía `ToastController`) al guardar, actualizar o si falla la consulta.                                                   |
| Limpiar el formulario                       | Tras guardar correctamente, el formulario vuelve a sus valores iniciales.                                                             |
| Consultar candidatos                        | Pestaña **Candidatos**: tarjetas con nombre, cargo, modalidad, experiencia, aspiración salarial, habilidades y fecha de registro.     |
| Detalle completo                            | `ion-modal` con todos los datos del documento, incluido el consentimiento y las fechas de registro/edición.                          |

### Funcionalidades adicionales

| Funcionalidad                      | Descripción                                                                                                                                                                    |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Ordenamiento por fecha de registro | La consulta usa `orderBy('creadoEn', 'desc')`; un `ion-segment` alterna entre **Recientes** y **Antiguos**.                                                                    |
| Edición de perfiles                | Botón **Editar perfil** en el detalle: abre el formulario precargado (`/tabs/registro?editar=<id>`), aplica las mismas validaciones y guarda con `updateDoc()` + `actualizadoEn`. |
| Búsqueda                           | `ion-searchbar` filtra por nombre, cargo, modalidad o habilidad.                                                                                                              |
| Actualizar deslizando              | `ion-refresher` vuelve a consultar Firestore; además el listado se recarga cada vez que se entra a la pestaña.                                                                |

---

## 4. Tecnologías y Componentes Ionic

### Tecnologías

| Tecnología                                              | Uso                                                     |
| ------------------------------------------------------- | ------------------------------------------------------- |
| [Ionic 9](https://ionicframework.com/)                  | Componentes de interfaz móvil                           |
| [Angular 22](https://angular.dev/) (Standalone, zoneless) | Framework, formularios reactivos tipados y signals      |
| [Firebase JS SDK](https://firebase.google.com/docs/web/setup) | Cloud Firestore (`addDoc`, `getDocs`, `getDoc`, `updateDoc`) |
| [Capacitor 8](https://capacitorjs.com/)                 | Compilación nativa para Android                         |
| ESLint · Prettier · Vitest · Playwright                 | Calidad de código y pruebas                             |

### Componentes Ionic utilizados

| Componente                                  | Dónde se usa                                                                 |
| ------------------------------------------- | ---------------------------------------------------------------------------- |
| `ion-input`                                 | Nombres, correo (`type="email"`), teléfono (`type="tel"`), experiencia y aspiración (`type="number"`) |
| `ion-datetime`                              | Fecha de nacimiento (no futura) y fecha disponible (desde hoy)               |
| `ion-accordion-group` / `ion-accordion`     | Contenedor desplegable de cada calendario                                    |
| `ion-radio-group` / `ion-radio`             | Nivel académico                                                              |
| `ion-select` / `ion-select-option`          | Cargo al que postula (5 opciones)                                            |
| `ion-checkbox`                              | Habilidades técnicas (selección múltiple) y consentimiento                   |
| `ion-textarea`                              | Resumen profesional                                                          |
| `ion-segment` / `ion-segment-button`        | Modalidad de trabajo y orden del listado                                     |
| `ion-button`                                | Guardar, actualizar, limpiar, cancelar, ver detalle, editar                  |
| `ion-list` / `ion-item` / `ion-label`       | Lista de niveles académicos y cabeceras de los acordeones                    |
| `ion-card`                                  | Bloques del formulario y tarjetas de candidatos                              |
| `ion-badge`                                 | Contador de habilidades seleccionadas                                        |
| `ion-toast`                                 | Mensajes de éxito y error                                                    |
| `ion-spinner`                               | Indicadores de carga                                                         |
| `ion-modal`                                 | Detalle completo del candidato                                               |
| `ion-searchbar`                             | Búsqueda en el listado                                                       |
| `ion-refresher`                             | Actualizar el listado deslizando                                             |
| `ion-tabs` / `ion-tab-bar` / `ion-tab-button` | Navegación entre **Postular** y **Candidatos**                             |
| `ion-header` / `ion-toolbar` / `ion-title` / `ion-content` / `ion-footer` / `ion-icon` | Estructura de las páginas |

---

## 5. Arquitectura

### Estructura de carpetas

```
TalentFlow/
├── docs/
│   ├── evidencias/               # Capturas de la aplicación y de Firestore
│   └── pruebas/                  # Capturas de los casos de prueba
├── scripts/
│   └── generar-env.mjs           # Genera la configuración de Firebase a partir de .env
├── src/
│   ├── app/
│   │   ├── models/
│   │   │   └── candidato.model.ts       # Interfaces CandidatoForm y Candidato
│   │   ├── services/
│   │   │   └── candidatos.service.ts    # Acceso a Firestore (único punto de contacto con la BD)
│   │   ├── validators/
│   │   │   └── candidato.validators.ts  # Validadores personalizados del formulario
│   │   ├── pages/
│   │   │   ├── tabs/                    # Barra de pestañas
│   │   │   ├── registro/                # Formulario de registro y edición
│   │   │   └── candidatos/              # Listado, búsqueda, orden y detalle
│   │   ├── app.component.ts
│   │   └── app.routes.ts                # Rutas con carga diferida
│   ├── environments/
│   │   ├── environment.ts / environment.prod.ts
│   │   └── firebase.config.ts           # GENERADO desde .env (no se versiona)
│   ├── theme/variables.scss             # Paleta de colores
│   └── global.scss
├── .env.example                  # Plantilla de variables de Firebase
├── firebase.json                 # Hosting + ruta de las reglas de Firestore
├── firestore.rules               # Reglas de seguridad de práctica
└── capacitor.config.ts
```

### Rutas

| Ruta                          | Página           | Descripción                                   |
| ----------------------------- | ---------------- | --------------------------------------------- |
| `/tabs/registro`              | `RegistroPage`   | Registrar un candidato nuevo                  |
| `/tabs/registro?editar=<id>`  | `RegistroPage`   | Editar el candidato con ese id de documento   |
| `/tabs/candidatos`            | `CandidatosPage` | Listado, búsqueda, orden y detalle            |

### Servicio Firebase (`CandidatosService`)

Las páginas **no** acceden directamente a Firestore: toda operación pasa por `CandidatosService`, que inicializa la app de Firebase una sola vez y encapsula la colección `candidatos`.

| Método                                   | Operación de Firestore                                  |
| ---------------------------------------- | ------------------------------------------------------- |
| `guardarCandidato(datos)`                | `addDoc()` + `creadoEn: serverTimestamp()`              |
| `obtenerCandidatos()`                    | `getDocs(query(..., orderBy('creadoEn', 'desc')))`      |
| `obtenerCandidatoPorId(id)`              | `getDoc()`                                              |
| `actualizarCandidato(id, datos)`         | `updateDoc()` + `actualizadoEn: serverTimestamp()`      |

> La aplicación es **zoneless** (Angular sin zone.js): el estado que cambia tras una operación asíncrona se guarda en _signals_ para que la vista se actualice.

---

## 6. Modelo de Datos

**Colección:** `candidatos` — un documento por postulante (id generado por Firestore).

| Campo                 | Tipo              | Validación                                             |
| --------------------- | ----------------- | ------------------------------------------------------ |
| `nombres`             | `string`          | Obligatorio; mínimo 3 caracteres (sin contar espacios) |
| `correo`              | `string`          | Obligatorio; formato válido con dominio                |
| `telefono`            | `string`          | Obligatorio; 7 a 15 dígitos (admite `+`, espacios, guiones) |
| `fechaNacimiento`     | `string` (`YYYY-MM-DD`) | Obligatoria; no futura                           |
| `cargo`               | `string`          | Obligatorio; una de 5 opciones                         |
| `nivelAcademico`      | `string`          | Obligatorio; Bachillerato, Tecnología, Tercer nivel o Posgrado |
| `experienciaAnios`    | `number` (entero) | Entero entre 0 y 50                                    |
| `modalidad`           | `string`          | Presencial, Híbrida o Remota                           |
| `habilidades`         | `array<string>`   | Al menos 1                                             |
| `fechaDisponibilidad` | `string` (`YYYY-MM-DD`) | Obligatoria; no anterior a hoy                   |
| `aspiracionSalarial`  | `number`          | Mayor que 0 (USD)                                      |
| `resumen`             | `string`          | Obligatorio; mínimo 30 caracteres                      |
| `consentimiento`      | `boolean`         | Debe ser `true` para guardar                           |
| `creadoEn`            | `timestamp`       | `serverTimestamp()` al crear                           |
| `actualizadoEn`       | `timestamp`       | `serverTimestamp()` al editar (solo si se editó)       |

**Ejemplo de documento (ficticio):**

```json
{
  "nombres": "Ana Pérez",
  "correo": "ana.ejemplo@correo.test",
  "telefono": "0990000000",
  "fechaNacimiento": "2000-04-15",
  "cargo": "Desarrollador móvil",
  "nivelAcademico": "Tercer nivel",
  "experienciaAnios": 3,
  "modalidad": "Híbrida",
  "habilidades": ["Ionic", "Angular", "Git"],
  "fechaDisponibilidad": "2026-12-01",
  "aspiracionSalarial": 1200,
  "resumen": "Desarrolladora de aplicaciones móviles con experiencia en interfaces y servicios web.",
  "consentimiento": true,
  "creadoEn": "11 de noviembre de 2026, 16:30:00 UTC-5"
}
```

> `creadoEn` y `actualizadoEn` son de tipo **timestamp** en Firestore; arriba se muestran como texto solo para ilustrar.

---

## 7. Instalación y Ejecución

### Prerrequisitos

| Herramienta                                            | Versión recomendada                                       |
| ------------------------------------------------------ | --------------------------------------------------------- |
| [Node.js](https://nodejs.org/)                         | v20.x o LTS vigente                                       |
| [npm](https://www.npmjs.com/)                          | v10.x o superior                                          |
| [Ionic CLI](https://ionicframework.com/docs/intro/cli) | Global (`npm i -g @ionic/cli`) o mediante `npx`           |
| Proyecto de [Firebase](https://console.firebase.google.com/) | Con **Cloud Firestore** habilitado                  |
| [Android Studio](https://developer.android.com/studio) | Solo para compilación nativa en Android                   |

### Pasos

1. **Clona el repositorio e instala las dependencias**

```bash
git clone https://github.com/Eduxrd-o/TalentFlow.git
cd TalentFlow
npm install
```

2. **Configura Firebase**

   1. En la [consola de Firebase](https://console.firebase.google.com/) crea un proyecto y habilita **Cloud Firestore**.
   2. Registra una **app web** (Configuración del proyecto → General → Tus apps) y copia los valores del SDK.
   3. Copia la plantilla de variables y completa los valores:

```bash
cp .env.example .env
```

```dotenv
FIREBASE_API_KEY=...
FIREBASE_AUTH_DOMAIN=...
FIREBASE_PROJECT_ID=...
FIREBASE_STORAGE_BUCKET=...
FIREBASE_MESSAGING_SENDER_ID=...
FIREBASE_APP_ID=...
FIREBASE_MEASUREMENT_ID=...   # opcional
```

   4. Publica las reglas de [`firestore.rules`](./firestore.rules): pégalas en **Firestore → Reglas** de la consola, o con la CLI de Firebase:

```bash
npx firebase-tools login
npx firebase-tools deploy --only firestore:rules --project <tu-project-id>
```

> El archivo `src/environments/firebase.config.ts` se **genera automáticamente** a partir de `.env` antes de `ionic serve`, `ionic build`, `npm start`, `npm run build` y las pruebas. Para generarlo manualmente: `npm run env`. Ni `.env` ni el archivo generado se versionan.

3. **Ejecuta la aplicación en el navegador**

```bash
npx ionic serve
```

4. **Compila para producción**

```bash
npx ionic build
```

5. **Compila y ejecuta en Android (opcional)**

```bash
npx ionic build
npx cap add android   # solo la primera vez (la carpeta android/ no se versiona)
npx cap sync android
npx cap open android
```

### Calidad de código

```bash
npm run lint        # ESLint + tipos de e2e + Prettier
npm run lint:fix    # Correcciones automáticas
npm run test:unit   # Pruebas unitarias (Vitest)
```

---

## 8. Evidencias

> Capturas sin datos sensibles. Las imágenes se guardan en [`docs/evidencias/`](./docs/evidencias/).

### Formulario de registro

| Datos personales | Perfil profesional | Disponibilidad y presentación |
| :---: | :---: | :---: |
| ![Datos personales](docs/evidencias/01-registro-datos-personales.png) | ![Perfil profesional](docs/evidencias/02-registro-perfil-profesional.png) | ![Disponibilidad y presentación](docs/evidencias/03-registro-disponibilidad-presentacion.png) |

### Validaciones y guardado

| Validaciones | Guardado exitoso |
| :---: | :---: |
| ![Validaciones](docs/evidencias/04-validaciones.png) | ![Guardado exitoso](docs/evidencias/05-guardado-exitoso.png) |

### Listado, detalle y edición

| Listado | Detalle | Edición |
| :---: | :---: | :---: |
| ![Listado](docs/evidencias/06-listado-candidatos.png) | ![Detalle](docs/evidencias/07-detalle-candidato.png) | ![Edición](docs/evidencias/08-edicion-perfil.png) |

| Ordenamiento por fecha | Búsqueda |
| :---: | :---: |
| ![Ordenamiento](docs/evidencias/09-ordenamiento.png) | ![Búsqueda](docs/evidencias/10-busqueda.png) |

### Cloud Firestore

| Colección `candidatos` | Documento | Reglas publicadas |
| :---: | :---: | :---: |
| ![Colección](docs/evidencias/11-firestore-coleccion.png) | ![Documento](docs/evidencias/12-firestore-documento.png) | ![Reglas](docs/evidencias/13-firestore-reglas.png) |

---

## 9. Pruebas

### Candidatos ficticios registrados

Se registraron **5 candidatos ficticios** con combinaciones distintas de cargo, nivel académico, modalidad y habilidades:

| # | Nombres            | Cargo               | Nivel académico | Modalidad  | Habilidades                  |
| - | ------------------ | ------------------- | --------------- | ---------- | ---------------------------- |
| 1 | _Pendiente_        | _Pendiente_         | _Pendiente_     | _Pendiente_| _Pendiente_                  |
| 2 | _Pendiente_        | _Pendiente_         | _Pendiente_     | _Pendiente_| _Pendiente_                  |
| 3 | _Pendiente_        | _Pendiente_         | _Pendiente_     | _Pendiente_| _Pendiente_                  |
| 4 | _Pendiente_        | _Pendiente_         | _Pendiente_     | _Pendiente_| _Pendiente_                  |
| 5 | _Pendiente_        | _Pendiente_         | _Pendiente_     | _Pendiente_| _Pendiente_                  |

### Casos de prueba

| ID  | Caso                                         | Pasos                                                                                         | Resultado esperado                                                                                   | Resultado obtenido | Evidencia |
| --- | -------------------------------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------ | --------- |
| P01 | Registro válido                              | Completar todos los campos correctamente y pulsar **Guardar Postulación**.                   | Toast de éxito, formulario limpio y nuevo documento en `candidatos` con `creadoEn`.                 | _Pendiente_        | [P01](docs/pruebas/P01-registro-valido.png) |
| P02 | Persistencia tras recargar                   | Registrar los 5 candidatos, recargar la aplicación y abrir **Candidatos**.                   | Se listan los 5 candidatos leídos desde Firestore.                                                   | _Pendiente_        | [P02](docs/pruebas/P02-persistencia.png) |
| P03 | ❌ Validación fallida: formulario vacío       | Pulsar **Guardar Postulación** sin completar campos.                                          | Mensajes de error junto a cada campo, toast de error y **ningún** documento nuevo.                  | _Pendiente_        | [P03](docs/pruebas/P03-validacion-vacio.png) |
| P04 | ❌ Validación fallida: datos fuera de rango   | Correo sin dominio, experiencia `2.5`, resumen de menos de 30 caracteres y sin consentimiento. | Errores en esos campos y **ningún** documento nuevo.                                                | _Pendiente_        | [P04](docs/pruebas/P04-validacion-rangos.png) |
| P05 | Detalle completo                             | En **Candidatos**, tocar una tarjeta.                                                         | El modal muestra todos los campos, el consentimiento y la fecha de registro.                         | _Pendiente_        | [P05](docs/pruebas/P05-detalle.png) |
| P06 | Edición de perfil                            | En el detalle, **Editar perfil**, cambiar el cargo y pulsar **Actualizar Postulación**.       | Toast de éxito, vuelta al listado con el cargo actualizado; `creadoEn` se conserva y se agrega `actualizadoEn`. | _Pendiente_ | [P06](docs/pruebas/P06-edicion.png) |
| P07 | Ordenamiento por fecha de registro           | Alternar **Recientes** / **Antiguos** en el listado.                                          | El orden de las tarjetas se invierte según `creadoEn`.                                               | _Pendiente_        | [P07](docs/pruebas/P07-ordenamiento.png) |

---

## 10. Seguridad y Limitaciones

### Reglas de Firestore empleadas

El taller se realiza **sin autenticación**, por lo que se usaron reglas de práctica limitadas a la colección `candidatos` (archivo [`firestore.rules`](./firestore.rules)):

| Operación  | Permitida | Condición                                                                                      |
| ---------- | :-------: | ---------------------------------------------------------------------------------------------- |
| `read`     | ✅        | Sin restricción                                                                                |
| `create`   | ✅        | Solo campos conocidos, tipos y rangos válidos, `consentimiento == true` y `creadoEn == request.time` |
| `update`   | ✅        | Mismas validaciones, `creadoEn` sin cambios y `actualizadoEn == request.time`                  |
| `delete`   | ❌        | Nunca                                                                                          |
| Otras colecciones | ❌ | Todo cerrado                                                                                  |

```js
match /candidatos/{candidatoId} {
  allow read: if true;
  allow create: if esCandidatoValido(request.resource.data)
    && request.resource.data.creadoEn == request.time;
  allow update: if esCandidatoValido(request.resource.data)
    && request.resource.data.creadoEn == resource.data.creadoEn
    && request.resource.data.actualizadoEn == request.time;
  allow delete: if false;
}
```

### Por qué no son aptas para producción

- **Cualquier persona puede leer todos los perfiles:** la lectura es pública y los datos de un candidato real (correo, teléfono, fecha de nacimiento, aspiración salarial) son información personal.
- **Cualquiera puede crear o modificar registros:** no hay identidad del usuario, así que no se puede saber quién creó o editó un documento ni impedir que alguien altere perfiles ajenos o inunde la colección.
- **La configuración web no es secreta:** aunque en el repositorio se lee desde `.env`, los valores de Firebase terminan dentro del JavaScript publicado; la protección real depende solo de las reglas.
- **Sin límites de uso ni auditoría:** no hay control de abuso, cuotas por usuario ni registro de cambios.

### Cómo se restringiría en una aplicación empresarial

1. **Firebase Authentication** para postulantes y personal de Talento Humano.
2. **Roles con _custom claims_:** solo el rol `rrhh` puede listar y leer todos los perfiles; un postulante solo lee y edita su propio documento (id = `request.auth.uid`).
3. **Firebase App Check** para aceptar solicitudes solo desde la app oficial, y **restricción de la API key** por dominio o paquete en Google Cloud.
4. **Validación y procesos sensibles en el servidor** (Cloud Functions), con registro de auditoría de cambios.
5. **Política de retención y privacidad real**, con consentimiento informado y eliminación de datos a solicitud.

Al terminar las pruebas, las reglas públicas se cierran:

```js
match /{document=**} {
  allow read, write: if false;
}
```

### Credenciales

- La configuración de Firebase se lee desde `.env` (no versionado); el repositorio solo incluye `.env.example`.
- No se publican cuentas de servicio, claves privadas ni contraseñas.
- El proyecto de Firebase es exclusivo para esta práctica, contiene solo datos ficticios y se eliminará al finalizar la evaluación.

### Limitaciones conocidas

- No hay eliminación de candidatos ni autenticación (fuera del alcance del MVP).
- Al editar un perfil cuya **fecha disponible** ya pasó, el formulario exige elegir una fecha desde hoy antes de guardar.
- Las pestañas de Ionic recuerdan su última ruta: si se sale de una edición sin guardar ni cancelar, al volver a **Postular** se retoma esa edición.
- La consulta ordenada por `creadoEn` solo lista documentos que tienen ese campo (todos los creados desde la app lo tienen).

---

## 11. Distribución del Trabajo

| Integrante           | Aportes                                                                                                                                                                                                                  |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Ganchala Eduardo** | Creación del proyecto, configuración de Firebase y modelo `Candidato`, servicio inicial de Firestore, paleta de colores, diseño de las páginas de registro y candidatos, selector de fechas con acordeón.               |
| **Ortiz Josué**      | Validaciones personalizadas y corrección de fechas, adaptación a Angular zoneless (signals), edición de perfiles, ordenamiento por fecha de registro, reglas de Firestore, configuración con `.env`, Capacitor Android y documentación. |

---

## Autores

Desarrollado por:

- **Ganchala Eduardo** · EPN · Periodo 2026B
- **Ortiz Josué** · EPN · Periodo 2026B
