# TalentFlow S.A. || `SEMANA 07 - CLASE 12 (11|11|2026)`

> Aplicación móvil Ionic para **registrar, validar, almacenar y consultar perfiles profesionales** de postulantes, con persistencia en **Firebase Cloud Firestore**.

---

## 1. Problema Empresarial

La empresa ficticia **TalentFlow S.A.** recibe hojas de vida por correo electrónico y tiene dificultades para organizar los perfiles de los candidatos. Talento Humano necesita una **aplicación móvil de registro de postulantes** que capture información estructurada y la almacene en la nube para consultarla después.

Alcance del prototipo (MVP):

- Sin autenticación ni carga de PDF: la hoja de vida se registra con un **formulario digital**.
- El ejemplo _Registro de estudiantes con Ionic y Firebase_ sirvió solo como referencia para la conexión con Firestore; modelo, formularios e interfaz se rediseñaron para reclutamiento.
- Todos los datos registrados son ficticios.

---

## 2. Integrantes

- **Ganchala Eduardo**
- **Ortiz Josué**

EPN · Periodo 2026B. Los aportes de cada uno están en [Distribución del Trabajo](#11-distribución-del-trabajo).

---

## 3. Objetivo y Funcionalidades

**Objetivo:** construir una aplicación Ionic que permita registrar, validar, almacenar y consultar perfiles profesionales mediante formularios con distintos componentes de Ionic y persistencia en Cloud Firestore.

### Funcionalidades obligatorias

| Funcionalidad                | Implementación                                                                                                       |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Registrar candidato          | Pestaña **Postular**: formulario en 4 bloques (`ion-card`) con mensajes de error junto a cada campo.                 |
| Guardar como nuevo documento | `addDoc()` en la colección `candidatos`, con `creadoEn: serverTimestamp()`.                                          |
| Validar antes de enviar      | Formulario reactivo tipado: si es inválido se marcan los campos, se muestra un toast y **no** se llama a Firestore. |
| Indicador de carga           | `ion-spinner` al guardar, al cargar el listado y al cargar un perfil para editar.                                    |
| Mensajes de éxito y error    | `ion-toast` (`ToastController`) al guardar, actualizar o si falla una consulta.                                      |
| Limpiar el formulario        | Tras guardar, el formulario vuelve a sus valores iniciales.                                                          |
| Consultar candidatos         | Pestaña **Candidatos**: tarjetas con nombre, cargo, modalidad, experiencia, aspiración, habilidades y fecha de registro. |
| Detalle completo             | `ion-modal` con todos los campos, el consentimiento y las fechas de registro y edición.                              |

### Funcionalidades adicionales

| Funcionalidad                      | Implementación                                                                                                                  |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Ordenamiento por fecha de registro | Consulta con `orderBy('creadoEn', 'desc')`; un `ion-segment` alterna entre **Recientes** y **Antiguos**.                        |
| Edición de perfiles                | **Editar perfil** en el detalle abre el formulario precargado, con las mismas validaciones, y guarda con `updateDoc()` + `actualizadoEn`. |
| Búsqueda                           | `ion-searchbar` filtra por nombre, cargo, modalidad o habilidad.                                                                |
| Pull-to-refresh                    | `ion-refresher` vuelve a consultar Firestore; el listado también se recarga al entrar a la pestaña.                             |

---

## 4. Tecnologías y Componentes Ionic

### Tecnologías

| Tecnología                                                    | Uso                                                          |
| ------------------------------------------------------------- | ------------------------------------------------------------ |
| [Ionic 9](https://ionicframework.com/)                        | Componentes de interfaz móvil                                |
| [Angular 22](https://angular.dev/) (standalone, zoneless)     | Formularios reactivos tipados, signals y rutas diferidas     |
| [Firebase JS SDK](https://firebase.google.com/docs/web/setup) | Cloud Firestore (`addDoc`, `getDocs`, `getDoc`, `updateDoc`) |
| [Capacitor 8](https://capacitorjs.com/)                       | Compilación nativa para Android                              |
| ESLint · Prettier · Vitest · Playwright                       | Calidad de código y pruebas                                  |

### Componentes Ionic utilizados

| Componente                                                                             | Dónde se usa                                                                                 |
| -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `ion-input`                                                                            | Nombres, correo (`email`), teléfono (`tel`), experiencia y aspiración (`number`)             |
| `ion-datetime` dentro de `ion-accordion-group` / `ion-accordion`                       | Fecha de nacimiento (no futura) y fecha disponible (desde hoy)                               |
| `ion-radio-group` / `ion-radio`                                                        | Nivel académico                                                                              |
| `ion-select` / `ion-select-option`                                                     | Cargo al que postula (5 opciones)                                                            |
| `ion-checkbox`                                                                         | Habilidades técnicas (selección múltiple) y consentimiento                                   |
| `ion-textarea`                                                                         | Resumen profesional                                                                          |
| `ion-segment` / `ion-segment-button`                                                   | Modalidad de trabajo y orden del listado                                                     |
| `ion-button`, `ion-badge`, `ion-spinner`, `ion-toast`                                  | Acciones, contador de habilidades, indicadores de carga y mensajes                           |
| `ion-list` / `ion-item` / `ion-label`, `ion-card`                                      | Niveles académicos, cabeceras de acordeón, bloques del formulario y tarjetas de candidatos   |
| `ion-modal`, `ion-searchbar`, `ion-refresher`                                          | Detalle, búsqueda y pull-to-refresh del listado                                              |
| `ion-tabs` / `ion-tab-bar` / `ion-tab-button`                                          | Navegación entre **Postular** y **Candidatos**                                               |
| `ion-header` / `ion-toolbar` / `ion-title` / `ion-content` / `ion-footer` / `ion-icon` | Estructura de las páginas                                                                    |

---

## 5. Arquitectura

### Estructura de carpetas

```
TalentFlow/
├── docs/
│   ├── evidencias/                      # Capturas de la app y de Firestore
│   └── pruebas/                         # Capturas de los casos de prueba
├── scripts/generar-env.mjs              # Genera la configuración de Firebase desde .env
├── src/
│   ├── app/
│   │   ├── models/candidato.model.ts    # Interfaces CandidatoForm y Candidato
│   │   ├── services/candidatos.service.ts
│   │   ├── validators/candidato.validators.ts
│   │   ├── pages/
│   │   │   ├── tabs/                    # Barra de pestañas
│   │   │   ├── registro/                # Formulario de registro y edición
│   │   │   └── candidatos/              # Listado, búsqueda, orden y detalle
│   │   └── app.routes.ts                # Rutas con carga diferida
│   ├── environments/
│   │   ├── environment.ts / environment.prod.ts
│   │   └── firebase.config.ts           # Generado desde .env (no se versiona)
│   ├── theme/variables.scss
│   └── global.scss
├── .env.example
├── firebase.json
├── firestore.rules
└── capacitor.config.ts
```

Rutas: `/tabs/registro` (registro nuevo), `/tabs/registro?editar=<id>` (edición del documento `<id>`) y `/tabs/candidatos` (listado).

### Servicio Firebase (`CandidatosService`)

Es el único punto de acceso a Firestore: inicializa la app de Firebase una sola vez y encapsula la colección `candidatos`. Las páginas solo llaman a sus métodos.

| Método                           | Operación de Firestore                             |
| -------------------------------- | -------------------------------------------------- |
| `guardarCandidato(datos)`        | `addDoc()` + `creadoEn: serverTimestamp()`         |
| `obtenerCandidatos()`            | `getDocs(query(..., orderBy('creadoEn', 'desc')))` |
| `obtenerCandidatoPorId(id)`      | `getDoc()`                                         |
| `actualizarCandidato(id, datos)` | `updateDoc()` + `actualizadoEn: serverTimestamp()` |

Como la app es zoneless, el estado que cambia tras una operación asíncrona se guarda en _signals_ para que la vista se actualice.

---

## 6. Modelo de Datos

**Colección:** `candidatos`, un documento por postulante (id generado por Firestore).

| Campo                 | Tipo                    | Validación                                                      |
| --------------------- | ----------------------- | --------------------------------------------------------------- |
| `nombres`             | `string`                | Obligatorio; mínimo 3 caracteres                                |
| `correo`              | `string`                | Obligatorio; formato válido con dominio                         |
| `telefono`            | `string`                | Obligatorio; exactamente 10 dígitos (se guardan solo dígitos)   |
| `fechaNacimiento`     | `string` (`YYYY-MM-DD`) | Obligatoria; no futura                                          |
| `cargo`               | `string`                | Obligatorio; una de 5 opciones                                  |
| `nivelAcademico`      | `string`                | Obligatorio; Bachillerato, Tecnología, Tercer nivel o Posgrado |
| `experienciaAnios`    | `number` (entero)       | Entero entre 0 y 50                                             |
| `modalidad`           | `string`                | Presencial, Híbrida o Remota                                    |
| `habilidades`         | `array<string>`         | Al menos 1                                                      |
| `fechaDisponibilidad` | `string` (`YYYY-MM-DD`) | Obligatoria; no anterior a hoy                                  |
| `aspiracionSalarial`  | `number`                | Mayor que 0 (USD)                                               |
| `resumen`             | `string`                | Obligatorio; mínimo 30 caracteres                               |
| `consentimiento`      | `boolean`               | Debe ser `true`                                                 |
| `creadoEn`            | `timestamp`             | `serverTimestamp()` al crear                                    |
| `actualizadoEn`       | `timestamp`             | `serverTimestamp()` al editar (solo si se editó)                |

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

`creadoEn` es un timestamp de Firestore; aquí se muestra como texto.

---

## 7. Instalación y Ejecución

### Requisitos

| Herramienta                                                  | Versión                                  |
| ------------------------------------------------------------ | ---------------------------------------- |
| [Node.js](https://nodejs.org/) y npm                         | Node 22.22+, 24.15+ o 26+                |
| [Ionic CLI](https://ionicframework.com/docs/intro/cli)       | Global (`npm i -g @ionic/cli`) o `npx`   |
| Proyecto de [Firebase](https://console.firebase.google.com/) | Con **Cloud Firestore** habilitado       |
| [Android Studio](https://developer.android.com/studio)       | Solo para compilar en Android            |

### Pasos

1. **Clonar e instalar dependencias**

```bash
git clone https://github.com/Eduxrd-o/TalentFlow.git
cd TalentFlow
npm install
```

2. **Configurar Firebase**
   1. En la [consola de Firebase](https://console.firebase.google.com/) crea un proyecto, habilita **Cloud Firestore** y registra una **app web** (Configuración del proyecto → General → Tus apps).
   2. Copia la plantilla y completa los valores del SDK:

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

   3. Publica [`firestore.rules`](./firestore.rules) en **Firestore → Reglas** de la consola, o con la CLI:

```bash
npx firebase-tools login
npx firebase-tools deploy --only firestore:rules --project <tu-project-id>
```

`src/environments/firebase.config.ts` se genera desde `.env` antes de `ionic serve`, `ionic build`, `npm start`, `npm run build`, el lint y las pruebas (manualmente: `npm run env`). Ninguno de los dos archivos se versiona.

3. **Ejecutar en el navegador**

```bash
npx ionic serve
```

4. **Compilar para producción y Android (opcional)**

```bash
npx ionic build
npx cap add android   # solo la primera vez (android/ no se versiona)
npx cap sync android
npx cap open android
```

Calidad de código: `npm run lint` (ESLint, tipos de e2e y Prettier) y `npm run test:unit` (Vitest).

---

## 8. Evidencias

Capturas sin datos sensibles, guardadas en [`docs/evidencias/`](./docs/evidencias/).

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

El taller no usa autenticación, así que se aplicaron reglas de práctica limitadas a la colección `candidatos` (ver [`firestore.rules`](./firestore.rules)):

| Operación         | Permitida | Condición                                                                                              |
| ----------------- | :-------: | ------------------------------------------------------------------------------------------------------ |
| `read`            | ✅        | Sin restricción                                                                                        |
| `create`          | ✅        | Solo campos conocidos, tipos y rangos válidos, `consentimiento == true` y `creadoEn == request.time`   |
| `update`          | ✅        | Mismas validaciones, `creadoEn` sin cambios y `actualizadoEn == request.time`                          |
| `delete`          | ❌        | Nunca                                                                                                  |
| Otras colecciones | ❌        | Todo cerrado                                                                                           |

### Por qué no son aptas para producción

- **Lectura pública:** cualquiera puede leer correo, teléfono, fecha de nacimiento y aspiración salarial de todos los candidatos.
- **Escritura anónima:** sin identidad no se puede saber quién creó o editó un documento, ni impedir que alguien altere perfiles ajenos o inunde la colección.
- **La configuración web no es secreta:** aunque se lee desde `.env`, termina dentro del JavaScript publicado; la protección depende solo de las reglas.
- **Sin control de abuso ni auditoría:** no hay cuotas por usuario ni registro de cambios.

### Cómo se restringiría en una aplicación real

1. **Firebase Authentication** para postulantes y personal de Talento Humano.
2. **Roles con _custom claims_:** solo `rrhh` lista todos los perfiles; un postulante lee y edita únicamente su documento (id = `request.auth.uid`).
3. **Firebase App Check** y **restricción de la API key** por dominio o paquete.
4. **Cloud Functions** para validaciones y procesos sensibles, con auditoría de cambios.
5. **Política de retención y privacidad**, con eliminación de datos a solicitud.

Al terminar las pruebas, la colección se cierra con `allow read, write: if false`. La configuración de Firebase vive solo en `.env` (no versionado); no se publican cuentas de servicio ni claves privadas, y el proyecto de Firebase es exclusivo de esta práctica.

### Limitaciones conocidas

- No hay eliminación de candidatos ni autenticación (fuera del alcance del MVP).
- Al editar un perfil cuya **fecha disponible** ya pasó, hay que elegir una fecha desde hoy antes de guardar.
- La consulta ordenada por `creadoEn` solo lista documentos que tienen ese campo (todos los creados desde la app lo tienen).

---

## 11. Distribución del Trabajo

| Integrante           | Aportes                                                                                                                                                                                                       |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Ganchala Eduardo** | Creación del proyecto, configuración de Firebase y modelo `Candidato`, servicio inicial de Firestore, paleta de colores, diseño de las páginas de registro y candidatos, selector de fechas con acordeón.    |
| **Ortiz Josué**      | Validaciones personalizadas y corrección de fechas, adaptación a Angular zoneless (signals), edición de perfiles, ordenamiento por fecha de registro, reglas de Firestore, configuración con `.env`, Capacitor Android y documentación. |
