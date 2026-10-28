# Ionic & Android Studio || `CLASE 08 (28|10|2026)`

Se realizó este proyecto como práctica y evaluación en la materia de Desarrollo de Aplicaciones Móviles mediante **Ionic**, **Angular (Standalone Components)** y **Capacitor**, implementando la solución **UrbanInspect**: una aplicación móvil para el reporte, consulta, geolocalización, verificación meteorológica, cambio de estado y seguimiento de incidencias de infraestructura urbana en el Distrito Metropolitano de Quito (DMQ). La aplicación integra servicios nativos del dispositivo (cámara, geolocalización y persistencia en preferencias) junto con servicios en la nube (MockAPI, Cloudinary y Open-Meteo) bajo una arquitectura reactiva zoneless y modo claro forzado.

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
cd Apps_GR1/src/Clase_08
```

_(o `cd src/Clase_08` si ya estás dentro del repositorio)_

2. **Instala Ionic CLI (dependencias raíz de la clase)**

En la carpeta raíz `Clase_08`, ejecuta la instalación para tener Ionic CLI y herramientas disponibles:

```bash
npm install
```

3. **Ingresa a la carpeta `municipio` e instala las dependencias de la aplicación**

Entra al directorio del proyecto `municipio` para descargar Angular, Capacitor y los componentes de Ionic:

```bash
cd municipio
npm install
```

4. **Ejecuta el servidor de desarrollo local en navegador**

Dentro del directorio `municipio`, inicia la aplicación web:

```bash
ionic serve
```

> **Nota:** Si no tienes Ionic instalado de forma global, puedes ejecutar `npx ionic serve`. En entorno de navegador, la cámara nativa ofrece fallback mediante selector de archivos y el clima simula condiciones o consulta la API con geolocalización manual.

5. **Compila y ejecuta en Android Studio (Nativo)**

Para desplegar la aplicación completa con cámara física y GPS nativo:

```bash
ionic build
npx cap sync android
npx cap open android
```

Una vez en Android Studio, ejecuta el proyecto en un emulador o dispositivo físico con depuración USB habilitada.

---

## Vista General del Proyecto

La solución está estructurada modularmente en `src/app/` separando lógica de negocio (`core`), páginas (`pages`) y componentes reutilizables:

| Componente / Archivo           | Responsabilidad                                                                                                                                                             |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `inicio.page.ts / html / scss` | Pantalla principal (Dashboard) con tarjetas de métricas en tiempo real (Total, Pendientes, En proceso, Resueltas, Alta abiertas), actualización continua y accesos rápidos.|
| `incidencias.page.ts / html`   | Listado paginado de incidencias (MockAPI) con scroll infinito, refresco pull-to-refresh, miniaturas, insignias de estado y alternador de favoritos/seguimiento.           |
| `registro.page.ts / html`      | Formulario de nueva incidencia con validación reactiva, integración de cámara, geolocalización GPS/manual, consulta climática y autoguardado en borrador.                 |
| `seguimiento.page.ts / html`   | Vista de incidencias marcadas para seguimiento local mediante `Preferences` de Capacitor sin impactar la base de datos remota.                                            |
| `cambio-estado.component.ts`   | Componente de máquina de estados con validación de transiciones permitidas, control de estado final y exigencia de observación de cierre (mín. 5 caracteres).                |
| `clima.component.ts`           | Widget de consulta meteorológica a Open-Meteo; detecta precipitaciones superiores a 5 mm y emite alertas preventivas antes de permitir guardar el registro.               |
| `foto.component.ts`            | Componente de captura fotográfica mediante `@capacitor/camera` con previsualización, compresión y subida directa unsigned a Cloudinary.                                    |
| `ubicacion.component.ts`       | Obtención de coordenadas mediante `@capacitor/geolocation` o entrada manual con validación geográfica estricta para el DMQ.                                                |
| `incidencias.service.ts`       | Servicio HTTP singleton para listado paginado, búsqueda por código, obtención por id, creación, actualización y resumen de métricas.                                        |
| `borrador.service.ts`          | Persistencia local en segundo plano del formulario incompleto mediante `@capacitor/preferences`, con diálogo de confirmación (Continuar/Descartar) al reabrir la app.        |
| `seguimiento.service.ts`       | Servicio singleton reactivo para almacenar y consultar el set de IDs marcados para seguimiento en almacenamiento local.                                                    |
| `estados.ts`                   | Matriz de transiciones válidas (`TRANSICIONES`), etiquetas y colores de estado; previene inconsistencias de flujo (`resuelta` no puede reabrirse).                        |

---

## Características Implementadas

- **Gestión reactiva de estado con Angular Zoneless y Signals:** Interfaz optimizada con detección de cambios zoneless (`provideZonelessChangeDetection`), señales computadas para validación dinámica en tiempo real y sincronización reactiva de UI.
- **Paginación remota y Scroll Infinito:** Consumo de MockAPI con parámetros `page` y `limit`, control de fin de registros y pull-to-refresh para recarga en caliente.
- **Validaciones de negocio dinámicas:**
  - Descripción con longitud mínima de 10 caracteres.
  - Dirección, sector, tipo y prioridad obligatorios.
  - Prioridad alta exige fotografía obligatoria.
  - Tipo *bache* exige obligatoriamente coordenadas geográficas (GPS o manuales).
  - Si existen coordenadas, es mandatoria la consulta climática previa.
- **Autoguardado inteligente de borradores:** Almacenamiento continuo del formulario en `Capacitor Preferences` y detección de registros inconclusos al iniciar la aplicación.
- **Inspección meteorológica en tiempo real:** Integración directa con **Open-Meteo** (sin API keys), alertando si el umbral de precipitación supera los 5 mm para trabajos en sitio.
- **Almacenamiento de multimedia en Cloudinary:** Carga de fotografías mediante API REST unsigned a Cloudinary, persistiendo únicamente la URL pública optimizada en el servicio backend.
- **Control estricto de transiciones de estado:** Ciclo de vida estandarizado (`pendiente` &rarr; `en_proceso` &rarr; `resuelta`). El estado *resuelta* es terminal y exige obligatoriamente una observación técnica de cierre.
- **Forzado visual a Modo Claro:** Desactivación de temas oscuros del sistema y aplicación consistente de fondo claro (`color-scheme: light`) para trabajo diurno en campo.

---

## Autor

Desarrollado por:

- **Ortiz Josué** · EPN · Periodo 2026B
