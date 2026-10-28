# Prueba: UrbanInspect - Gestión de Incidencias || `CLASE 08 (28|10|2026)`

Aplicación móvil desarrollada con **Ionic**, **Angular (Standalone Components)** y **Capacitor** para el reporte, registro, geolocalización, inspección climática y control del ciclo de vida de incidencias de infraestructura urbana en el Distrito Metropolitano de Quito (DMQ). Implementa validación reactiva de formularios con **Angular Signals**, captura de fotografías con subida a la nube en **Cloudinary**, geolocalización por hardware y entrada manual, consulta meteorológica en vivo con **Open-Meteo**, autoguardado de borradores y seguimiento local con `@capacitor/preferences`.

---

## Cómo Instalar y Ejecutar

### Prerrequisitos

| Herramienta                                            | Versión recomendada                                       |
| ------------------------------------------------------ | --------------------------------------------------------- |
| [Node.js](https://nodejs.org/)                         | v20.x o LTS vigente                                       |
| [npm](https://www.npmjs.com/)                          | v10.x o superior                                          |
| [Ionic CLI](https://ionicframework.com/docs/intro/cli) | Incluido en dependencias o global (`npm i -g @ionic/cli`) |
| [Android Studio](https://developer.android.com/studio) | Para compilación y emulación nativa en Android            |
| [Visual Studio Code](https://code.visualstudio.com/)   | Editor de código recomendado                              |

---

### Pasos

1. **Navega al directorio del proyecto**

```bash
cd src/Clase_08/municipio
```

2. **Instala las dependencias**

```bash
npm install
```

3. **Inicia el servidor de desarrollo local**

```bash
ionic serve
```

> **Nota:** Si no tienes Ionic instalado de forma global, puedes ejecutar `npx ionic serve`.

4. **Compilación y despliegue nativo en Android**

Para probar la captura de fotos mediante la cámara real del teléfono y el sensor GPS:

```bash
ionic build
npx cap sync android
npx cap open android
```

5. **Visualiza la aplicación**

- En navegador: `http://localhost:8100/` activando el modo responsive móvil (`F12`).
- En dispositivo físico: Mediante Android Studio seleccionando el dispositivo con depuración USB activada.

---

## Vista General del Proyecto

| Componente / Archivo           | Responsabilidad                                                                                                                                                                                   |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `inicio.page.ts / html / scss` | Panel de control inicial con métricas calculadas en tiempo real (Total, Pendientes, En proceso, Resueltas, Alta abiertas), soporte pull-to-refresh y navegación centralizada.                   |
| `incidencias.page.ts / html`   | Catálogo paginado de incidencias con consumo de MockAPI, infinite scroll incremental, pull-to-refresh reactivo y conmutador para marcar seguimiento local.                                      |
| `registro.page.ts / html`      | Formulario de alta con validaciones dinámicas basadas en Angular Signals, recuperación de borradores inconclusos, geolocalización, captura de imagen y consulta previa de clima.                 |
| `seguimiento.page.ts / html`   | Bandeja de incidencias favoritas marcadas para monitoreo continuo, persistidas en `Preferences` nativas sin alterar la API central.                                                              |
| `cambio-estado.component.ts`   | Control visual e interactivo de transiciones de estado (`pendiente` &rarr; `en_proceso` &rarr; `resuelta`), con validación de estados terminales y obligatoriedad de observación en la resolución. |
| `clima.component.ts`           | Componente de verificación meteorológica con Open-Meteo; advierte condiciones de riesgo ante precipitaciones superiores a 5 mm.                                                                   |
| `foto.component.ts`            | Módulo de toma de fotografía con `@capacitor/camera`, vista previa y envío directo a Cloudinary mediante upload preset unsigned.                                                                  |
| `ubicacion.component.ts`       | Obtención de coordenadas mediante sensor GPS (`@capacitor/geolocation`) o digitación manual con validación de rangos de latitud y longitud.                                                        |
| `borrador.service.ts`          | Servicio de respaldo automático en segundo plano para no perder datos en caso de cierre accidental de la aplicación.                                                                              |
| `incidencias.service.ts`       | Cliente HTTP para operaciones CRUD sobre el endpoint `/incidencias` en MockAPI.                                                                                                                  |
| `seguimiento.service.ts`       | Almacenamiento local mediante señales y `@capacitor/preferences` para persistir la lista de incidencias en seguimiento.                                                                         |
| `estados.ts`                   | Fuente única de verdad para el flujo de estados permitidos y mapa de colores/etiquetas en la interfaz.                                                                                            |

---

## Reglas y Validaciones Implementadas

- **Validación de Formulario (Registro):**
  - **Tipo de Incidencia:** Selección obligatoria (luminaria, bache, señalización, alcantarilla, parque).
  - **Descripción:** Texto explicativo obligatorio con longitud mínima de 10 caracteres.
  - **Dirección y Sector:** Campos de texto requeridos para la ubicación referencial.
  - **Prioridad:** Selección requerida (baja, media, alta).
  - **Fotografía obligatoria por prioridad:** Si la prioridad es **Alta**, el registro exige obligatoriamente adjuntar una fotografía.
  - **Geolocalización obligatoria por tipo:** Si el tipo es **Bache**, la ubicación geográfica (latitud y longitud válidas) es mandatoria.
  - **Revisión del clima:** Si se especifican coordenadas geográficas, el operario debe obligatoriamente presionar "Consultar clima" antes de poder guardar el formulario. Si las coordenadas cambian, la validación se reinicia.

- **Flujo de Ciclo de Vida y Transiciones de Estado:**
  - `pendiente` &rarr; puede cambiar a `en_proceso` o `resuelta`.
  - `en_proceso` &rarr; únicamente puede cambiar a `resuelta`.
  - `resuelta` &rarr; **estado final y cerrado** (no se permite revertir a estados anteriores).
  - **Observación de cierre:** Al marcar una incidencia como `resuelta`, es obligatorio ingresar una observación técnica explicativa de al menos 5 caracteres.

- **Autoguardado y Recuperación de Borrador:**
  - Cada modificación en el formulario se persiste automáticamente en `Preferences`.
  - Al abrir la página de registro o iniciar la app, si existe un borrador previo, se presenta un diálogo para **Continuar** la edición o **Descartar** el borrador definitivamente.
  - Al registrar exitosamente la incidencia, el borrador se purga automáticamente.

---

## Servicios Externos Integrados

| Servicio | Uso | Justificación Técnica |
|---|---|---|
| **MockAPI** | Backend de oficina (`/incidencias`) | API REST simulada con soporte de paginación (`page`, `limit`), ordenamiento y operaciones CRUD. |
| **Open-Meteo** | Inspección climática en sitio | API meteorológica abierta, sin necesidad de credenciales ni API keys, provee precipitación actual y código WMO. |
| **Cloudinary** | Almacenamiento de fotografías | Carga segura mediante preset unsigned en la nube, optimización de imágenes y generación de URLs públicas permanentes. |

---

## Autor

Desarrollado por:

- **Ortiz Josué** · EPN · Periodo 2026B
