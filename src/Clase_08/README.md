# UrbanInspect

Aplicación móvil para registrar, consultar y actualizar incidencias de infraestructura urbana del DMQ (Prueba I, Desarrollo de Aplicaciones Móviles, ESFOT-EPN).

## Tecnologías
Ionic 8 + Angular standalone + TypeScript + Capacitor (Android).

## Requisitos previos
- Node.js LTS y npm
- Ionic CLI (`npm i -g @ionic/cli`)
- Android Studio con un emulador o un teléfono con depuración USB

## Instalación y ejecución
```bash
npm install
ionic serve                 # navegador (la cámara solo funciona en Android)
ionic build
npx cap sync android
npx cap open android        # ejecutar desde Android Studio
```
APK de depuración: `android/app/build/outputs/apk/debug/app-debug.apk`

## Configuración
En `src/environments/environment.ts`:
- `apiUrl`: URL del recurso `incidencias` en MockAPI.
- `cloudinary.cloudName` y `cloudinary.uploadPreset`: preset **unsigned** (no es una credencial secreta).

## Servicios externos
| Servicio | Uso | Motivo |
|---|---|---|
| MockAPI | Servicio de oficina (`/incidencias`) | API REST simulada con paginación `page`/`limit` |
| Open-Meteo | Clima antes de guardar (R4) | Sin API key, independiente, precipitación en mm |
| Cloudinary | Almacenamiento de fotos (R6) | URL pública permanente; subida unsigned sin secretos |

## Dependencias adicionales
| Paquete | Requisito |
|---|---|
| `@capacitor/camera` | R6: captura de fotografía |
| `@capacitor/geolocation` | R7: coordenadas actuales |
| `@capacitor/preferences` | R1: seguimiento local; R8: borrador |

Open-Meteo y Cloudinary se consumen con `HttpClient`, sin librerías extra.

## Decisiones técnicas
- Paginación remota con `page` y `limit`; el fin se detecta cuando una página trae menos de `PAGE_SIZE` registros.
- Seguimiento y borrador en `Preferences` (almacenamiento nativo), nunca en la API.
- Reglas de negocio con `computed` de Angular signals (prioridad alta → foto; bache → ubicación).
- Transiciones de estado centralizadas en `core/utils/estados.ts`; una incidencia resuelta es final.
- La foto se sube a Cloudinary antes del POST; en la API se guarda solo la URL.
- El clima se descarta si cambian las coordenadas y no se recupera del borrador.

## Estructura
```
src/app/
  core/      modelos, servicios y utilidades
  shared/    componentes reutilizables (foto, ubicación, clima, cambio de estado)
  pages/     inicio, incidencias, detalle, registro, seguimiento
```

## Autor
<Nombre> · Paralelo <X>
