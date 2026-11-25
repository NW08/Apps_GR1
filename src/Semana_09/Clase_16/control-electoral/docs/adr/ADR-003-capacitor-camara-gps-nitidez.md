# ADR-003: Capturar la foto del acta solo con la cámara (Capacitor), comprobar su nitidez con la varianza del Laplaciano y guardar el GPS como campos del registro

| Campo | Valor |
|---|---|
| **Estado** | Aceptado |
| **Fecha** | 2026-11-24 |
| **Autor(es) y equipo** | Equipo 6: Eduardo Ganchala, Josué Ortiz |
| **Origen** | Propuesta de Josué Ortiz (su ADR-003), con modificaciones del debate. Sustituye a la propuesta de Eduardo Ganchala (su ADR-005, coincidente en lo técnico). |
| **Requisitos relacionados** | R7 (foto desde la app, nitidez antes de aceptar, GPS como campos, permisos y errores), R6 (el acta incluye foto y ubicación), R5 (el coordinador corrige fotos), R10 (fotos pendientes sin conexión). |

## Contexto

Cada acta (alcaldía y prefectura) necesita una foto que sirva como **evidencia auténtica**, una comprobación de nitidez antes de
aceptarla y las coordenadas GPS como campos del registro. Los permisos pueden negarse, el GPS puede fallar en interiores o en
recintos sin cobertura, y las fotos de 12 MP pesan 3–6 MB. Debe funcionar en un Android físico sin servicios de pago.

## Alternativas consideradas

**Origen de la foto**

| Criterio | **A. Solo cámara (`CameraSource.Camera`)** | B. Cámara o galería (`CameraSource.Prompt`) |
|---|---|---|
| Autenticidad | La foto se toma en el momento, desde la app. | Una foto de galería puede ser antigua, de otra mesa o editada. |
| Flexibilidad | Si la cámara falla, hay que repetir. | Permite reutilizar una foto tomada con otro teléfono. |

**Captura:** `@capacitor/camera` (oficial, control de calidad y tamaño, permisos explícitos) frente a `<input type="file" capture>`
(comportamiento distinto según el dispositivo) y a un escáner de documentos con ML Kit (dependencia extra de Google Play Services).

**Nitidez**

| Criterio | **A. Varianza del Laplaciano en canvas (TypeScript propio)** | B. OpenCV.js | C. Solo confirmación visual |
|---|---|---|---|
| Peso | ~60 líneas, sin dependencias. | ~8 MB de WASM. | 0. |
| Explicable en la defensa | Sí: convolución 3×3 sobre escala de grises. | Caja negra. | — |
| Cumple «comprobar nitidez» | Sí. | Sí. | **No**. |

**Ubicación sin GPS**

| Criterio | **A. Guardar con la etiqueta «Ubicación no comprobable»** | B. Bloquear el registro hasta obtener GPS |
|---|---|---|
| Recintos sin cobertura | El acta no se pierde. | El veedor no puede registrar. |
| Control | El coordinador ve qué actas no tienen ubicación verificable. | Ubicación siempre presente. |

## Decisión

- **Captura:** `Camera.getPhoto({ source: CameraSource.Camera, resultType: CameraResultType.Uri, quality: 70, width: 1600,
  correctOrientation: true, saveToGallery: false })`. **No se permite la galería.** La imagen (JPEG de ~300–600 KB) se sube como
  `Blob` al bucket privado (ADR-008) o, sin conexión, se guarda en `Filesystem` (ADR-006).
- **Nitidez** (`image-quality.util.ts`, función pura con pruebas):
  1. reducir la imagen a ~500 px de ancho en un `canvas` y pasarla a escala de grises;
  2. aplicar el kernel Laplaciano `[0,1,0; 1,-4,1; 0,1,0]` y calcular la varianza;
  3. rechazar si `varianza < UMBRAL_NITIDEZ_POR_DEFECTO` (**100**) o si el brillo medio es menor que `BRILLO_MINIMO_POR_DEFECTO`
     (**35**), con el mensaje «La foto está borrosa u oscura; vuelva a tomarla con buena luz y sin mover el teléfono»;
  4. la foto aceptada se muestra en vista previa con «Usar foto» / «Repetir».
- **GPS:** `Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 15000, maximumAge: 0 })` al aceptar la foto. Se
  guardan `lat`, `lng`, `precision_m` y `capturado_en` como columnas del acta. Si el GPS falla (permiso denegado, apagado o tiempo
  agotado), la app ofrece «Reintentar» y, si persiste, **permite guardar** con `ubicacion_comprobable = false` y la etiqueta
  visible **«Ubicación no comprobable»** para el coordinador y el dashboard.
- **Permisos:** `DevicePermissionsService` llama a `checkPermissions()` antes de cada uso; si es `prompt`, pide el permiso; si es
  `denied`, explica cómo activarlo en Ajustes. `AndroidManifest.xml` declara `CAMERA`, `ACCESS_FINE_LOCATION` y
  `ACCESS_COARSE_LOCATION`.
- **Errores con mensajes en español:** cancelación de la cámara (no es error), permiso denegado, GPS desactivado, tiempo agotado,
  foto borrosa u oscura y fallo de subida.

## Consecuencias

- **Beneficios:** evidencia auténtica; regla de nitidez explicable y probada; fotos ligeras para datos móviles y la cola offline; el
  acta no se pierde por falta de GPS.
- **Obligaciones:** calibrar el umbral y el brillo con fotos reales; probar en un dispositivo físico.
- **Limitaciones:** la varianza también baja con poca textura (hoja casi en blanco) y puede rechazar fotos válidas; se puede repetir
  sin límite y el coordinador de recinto puede corregir la foto (R5).
- **Riesgo:** un veedor podría desactivar el GPS a propósito para no registrar su ubicación. **Mitigación:** la etiqueta «Ubicación no
  comprobable» queda visible y filtrable en el dashboard y en la lista de GPS (ADR-009).

## Verificación

- `image-quality.util.spec.ts`: una imagen sintética nítida supera el umbral; la misma difuminada no; una imagen negra no supera el brillo.
- Manual en Android: negar el permiso de cámara → mensaje con instrucciones; foto movida → rechazo; GPS apagado → se guarda con
  «Ubicación no comprobable»; foto nítida con GPS → el acta guarda `lat`, `lng` y `precision_m`.
- El selector de la cámara no ofrece la galería.

## Uso de IA

- **Josué Ortiz · Claude (Anthropic):** cómo comprobar la nitidez sin librerías pesadas y gestionar permisos de Capacitor; sugirió la
  varianza del Laplaciano y `checkPermissions`/`requestPermissions`. Se aceptó; la regla de GPS obligatorio se cambió en el debate.
- **Eduardo Ganchala · Gemini:** recomendó evaluar la nitidez en el cliente y verificar permisos explícitamente. Se aceptó parcialmente.
- **Verificación humana:** calibración del umbral (100) y del brillo (35) con fotos reales en un dispositivo físico.

## Trazabilidad

- Propuestas: `adr-mio/ADR-003-capacitor-camara-gps-nitidez.md` (aceptada con modificaciones) ·
  `adr-edu/ADR-005-capacitor-camara-gps-permisos.md` (sustituida).
- Commit del ADR: [enlace]
- Commit de implementación: [enlace: `camera.service.ts`, `geolocation.service.ts`, `image-quality.util.ts`]

## Consenso del equipo

| Integrante | Postura y argumentos | Objeciones |
|---|---|---|
| Josué Ortiz | Solo cámara, Laplaciano con umbral 100, permisos explícitos. En la reunión propuso guardar sin GPS con etiqueta (cambio respecto a su propuesta escrita). | A la galería: una foto de galería puede ser fraudulenta o estar modificada. |
| Eduardo Ganchala | Capacitor Camera y Geolocation con Laplaciano. Propuso permitir la galería. En la reunión también propuso guardar sin GPS con etiqueta (cambio respecto a su propuesta escrita). | Ninguna |

**Desacuerdo relevante:** permitir o no la galería.

**Acuerdo final:** solo cámara, sin galería, por los requisitos y la verificación de autenticidad; guardado sin GPS con la etiqueta
«Ubicación no comprobable», porque hay lugares sin conexión; umbral 100 y brillo mínimo 35. · **Minuto del video:** 00:18:17–00:28:09 (consenso 00:26:24–00:28:09)
