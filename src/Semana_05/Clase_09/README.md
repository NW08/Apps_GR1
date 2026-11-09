# UrbanInspect (Prueba Corregida) || `SEMANA 05 - CLASE 09 (29|10|2026)`

Se realizó esta versión corregida de la prueba de la Clase 08 en la materia de Desarrollo de Aplicaciones Móviles mediante **Ionic**, **Angular (Standalone Components)** y **Capacitor**. Parte de la solución **UrbanInspect** (reporte, consulta, geolocalización, verificación meteorológica, cambio de estado y seguimiento de incidencias de infraestructura urbana en el Distrito Metropolitano de Quito) y se centra en **corregir y mejorar las funciones existentes y la interfaz**, sin añadir módulos nuevos. Destaca la vista de **detalle de cada incidencia**, que antes estaba vacía, y desde la que ahora se consulta toda la información y se cambia el estado.

> Este mismo contenido vive de forma independiente en la rama [`prueba_uno_mejorada`](https://github.com/NW08/Apps_GR1/tree/prueba_uno_mejorada).

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
cd Apps_GR1/src/Semana_05/Clase_09
```

_(o `git clone -b prueba_uno_mejorada https://github.com/NW08/Apps_GR1.git` para obtener solo este proyecto en la raíz)_

2. **Instala Ionic CLI (dependencias raíz de la clase)**

```bash
npm install
```

3. **Ingresa a la carpeta `municipio` e instala las dependencias de la aplicación**

```bash
cd municipio
npm install
```

4. **Ejecuta el servidor de desarrollo local en navegador**

```bash
ionic serve
```

> **Nota:** Si no tienes Ionic instalado de forma global, puedes ejecutar `npx ionic serve`.

5. **Compila y ejecuta en Android Studio (Nativo)**

```bash
ionic build
npx cap add android   # solo la primera vez (la carpeta android/ no se versiona)
npx cap sync android
npx cap open android
```

Una vez en Android Studio, ejecuta el proyecto en un emulador o dispositivo físico con depuración USB habilitada.

---

## Correcciones y Mejoras Realizadas

### Visualización de incidencias

- **Detalle de incidencia (`incidencias/:id`):** la página existía pero estaba vacía. Ahora muestra la fotografía (o el ícono del tipo), el estado, la prioridad, el tipo, la descripción, la dirección, el sector y la fecha y hora de registro.
- **Ubicación en mapa:** si la incidencia tiene coordenadas, se muestran en un mapa embebido de OpenStreetMap con un acceso directo a "Cómo llegar".
- **Clima actual en el sitio:** se reutiliza el componente de Open-Meteo para consultar las condiciones actuales en la ubicación de la incidencia.
- **Navegación:** tocar cualquier tarjeta del listado o de seguimiento abre su detalle; la estrella sigue marcando/desmarcando el seguimiento sin abrir el detalle.

### Cambio de estado

- El componente `cambio-estado` estaba implementado pero **no se usaba en ninguna pantalla**. Ahora está integrado en el detalle.
- Se pide confirmación antes de marcar una incidencia como **resuelta**, porque es un estado final.
- La selección y la observación se limpian al guardar o al recargar la incidencia.

### Listado y seguimiento

- Tarjeta de incidencia compartida (`incidencia-item`) para el listado y para seguimiento, con miniatura, tipo legible ("Señalización deteriorada" en lugar de `senalizacion`), estado, sector, fecha y aviso de prioridad alta.
- **Colores de estado unificados** en toda la app (antes el listado y el componente de estado usaban colores distintos para el mismo estado).
- Recarga del listado corregida: una nueva recarga cancela la petición anterior (no se mezclan respuestas), se evitan duplicados por `id` y, ante un error en una página intermedia, se reintenta esa misma página sin perder la lista.
- El listado solo se recarga al volver si hubo un alta o un cambio de estado, por lo que al regresar del detalle se conserva la posición del scroll.
- Seguimiento: al quitar la estrella, la incidencia desaparece al instante; se añadió pull-to-refresh.

### Interfaz general

- La app inicia en el **panel de inicio** (antes iniciaba en el listado y el panel no tenía acceso directo).
- Panel con total, barra de avance de resueltas, métricas por estado y alerta de prioridad alta sin resolver.
- Formulario de registro organizado por secciones (datos, fotografía, ubicación y clima) con campos de contorno; foto y ubicación con íconos y estados más claros.
- Estados de carga, vacío y error consistentes, con botón de reintento en todas las pantallas.
- Se eliminó la página `home` de la plantilla, que no se usaba, y la consulta de clima ya no hace una petición duplicada al iniciar.

---

## Vista General del Proyecto

| Componente / Archivo           | Responsabilidad                                                                                                                       |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| `inicio.page.*`                | Panel con métricas por estado, avance de resueltas, alerta de prioridad alta y accesos rápidos.                                       |
| `incidencias.page.*`           | Listado paginado (MockAPI) con infinite scroll, pull-to-refresh, reintento por página y botón flotante para registrar.                |
| `detalle.page.*`               | Información completa de la incidencia, mapa, clima actual en el sitio y cambio de estado.                                             |
| `registro.page.*`              | Formulario con validaciones reactivas (Signals), foto, ubicación, clima obligatorio con coordenadas y autoguardado de borrador.       |
| `seguimiento.page.*`           | Incidencias marcadas con estrella, persistidas localmente con `@capacitor/preferences`.                                               |
| `incidencia-item.component.ts` | Tarjeta reutilizable de incidencia con navegación al detalle y alternador de seguimiento.                                             |
| `cambio-estado.component.ts`   | Transiciones permitidas (`pendiente` &rarr; `en_proceso` &rarr; `resuelta`), observación de cierre obligatoria y confirmación final. |
| `clima.component.ts`           | Consulta a Open-Meteo con alerta de lluvia intensa (≥ 5 mm).                                                                          |
| `foto.component.ts`            | Captura con `@capacitor/camera` y vista previa; la imagen se sube a Cloudinary al guardar.                                            |
| `ubicacion.component.ts`       | Coordenadas por GPS (`@capacitor/geolocation`) o ingreso manual validado.                                                             |
| `incidencias.service.ts`       | Cliente HTTP de MockAPI; expone una versión que cambia con cada alta o actualización para refrescar las vistas.                       |
| `estados.ts`                   | Fuente única de transiciones, etiquetas, colores e íconos de estado, tipo y prioridad.                                                |

---

## Reglas y Validaciones (se mantienen)

- Tipo, descripción (mín. 10 caracteres), dirección, sector y prioridad obligatorios.
- Prioridad **alta** exige fotografía; tipo **bache** exige coordenadas.
- Con coordenadas, el clima debe consultarse antes de guardar.
- `resuelta` es un estado final y exige una observación de cierre (mín. 5 caracteres).
- Autoguardado del formulario en `Preferences`, con opción de continuar o descartar al volver a abrirlo.

---

## Servicios Externos Integrados

| Servicio          | Uso                                                            |
| ----------------- | -------------------------------------------------------------- |
| **MockAPI**       | Backend REST de incidencias (`/incidencias`) con paginación.   |
| **Cloudinary**    | Almacenamiento de fotografías mediante upload preset unsigned. |
| **Open-Meteo**    | Clima actual por coordenadas, sin API key.                     |
| **OpenStreetMap** | Mapa embebido de la ubicación en el detalle.                   |

---

## Autor

Desarrollado por:

- **Ortiz Josué** · EPN · Periodo 2026B
