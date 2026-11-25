# ADR-003: Capturar fotos con @capacitor/camera, ubicación con @capacitor/geolocation y comprobar la nitidez con la varianza del Laplaciano

| Campo | Valor |
|---|---|
| **Estado** | Aceptado con modificaciones (ver «Consenso del equipo»): el acta se guarda sin GPS con la etiqueta «Ubicación no comprobable» y se fija el brillo mínimo en 35 |
| **Fecha** | 2026-11-23 |
| **Autor(es) y equipo** | Josué Ortiz · Equipo 6: Eduardo Ganchala, Josué Ortiz |
| **Requisitos relacionados** | R7 (foto de cada acta desde la app, nitidez antes de aceptar, GPS como campos del registro, permisos y errores), R6 (el registro del acta incluye foto y ubicación), R5 (el coordinador corrige fotos), R10 (fotos pendientes sin conexión). |

## Contexto

Cada acta (alcaldía y prefectura) necesita:

- una **foto tomada en el momento** desde la app (no una imagen cualquiera de la galería);
- una **comprobación de nitidez** antes de aceptarla, porque una foto movida no sirve como evidencia;
- las **coordenadas GPS** guardadas como campos del registro.

Los permisos de cámara y ubicación pueden negarse, el GPS puede tardar o fallar en interiores, y las fotos de 12 MP pesan 3–6 MB
(caro para subirlas con datos móviles). Criterio adicional: que funcione en un Android físico sin servicios de pago.

## Alternativas consideradas

**Captura**

| Criterio                       | **A. `@capacitor/camera` (`CameraSource.Camera`)**  | B. `<input type="file" capture>` en la WebView   | C. Plugin de escáner de documentos (ML Kit)      |
| ------------------------------ | --------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------ |
| Oficial / mantenido            | Plugin oficial de Capacitor.                        | Estándar web; el control en Android es limitado. | Comunitario; depende de Google Play Services.    |
| Forzar la cámara (sin galería) | Sí (`source: CameraSource.Camera`).                 | No se garantiza.                                 | Sí.                                              |
| Control de calidad y tamaño    | `quality`, `width`, `height`, `correctOrientation`. | Ninguno.                                         | Recorte de bordes automático.                    |
| Permisos                       | `checkPermissions` / `requestPermissions`.          | Implícitos y poco claros.                        | Propios.                                         |
| Riesgo                         | Bajo.                                               | Comportamiento distinto según el dispositivo.    | Dependencia extra y más superficie que defender. |

**Nitidez**

| Criterio                   | **A. Varianza del Laplaciano en canvas (TypeScript propio)** | B. OpenCV.js   | C. Sin comprobación automática (solo confirmación visual) |
| -------------------------- | ------------------------------------------------------------ | -------------- | --------------------------------------------------------- |
| Peso                       | ~60 líneas, sin dependencias.                                | ~8 MB de WASM. | 0.                                                        |
| Explicable en la defensa   | Sí: convolución 3×3 sobre escala de grises.                  | Caja negra.    | —                                                         |
| Cumple «comprobar nitidez» | Sí.                                                          | Sí.            | **No** (R7 lo pide).                                      |

**Ubicación:** `@capacitor/geolocation` (oficial) frente a la API web `navigator.geolocation`. Se elige el plugin por su gestión
explícita de permisos en Android.

## Decisión

- **Captura:** `Camera.getPhoto({ source: CameraSource.Camera, resultType: CameraResultType.Uri, quality: 70, width: 1600,
  correctOrientation: true, saveToGallery: false })`. La imagen resultante (JPEG, ~300–600 KB) se convierte en `Blob` para subirla y,
  en modo offline, se guarda en `Filesystem` (ADR-006).
- **Nitidez** (`image-quality.util.ts`, función pura con pruebas):
  1. Dibujar la imagen reducida a ~500 px de ancho en un `OffscreenCanvas`/`canvas` y pasarla a escala de grises (luminancia).
  2. Aplicar el kernel Laplaciano `[0,1,0; 1,-4,1; 0,1,0]` y calcular la **varianza** de la respuesta.
  3. Si `varianza < UMBRAL` → la foto se rechaza con el mensaje «La foto está borrosa; vuelva a tomarla con buena luz y sin mover el
     teléfono». **Umbral inicial: 100**, calibrado con 10 fotos nítidas y 10 movidas de actas impresas (se documenta el valor final).
  4. Se comprueba también un **brillo medio** mínimo, para no aceptar fotos negras.
  5. La foto aceptada se muestra en vista previa con el botón «Usar foto» / «Repetir».
- **GPS:** `Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 15000, maximumAge: 0 })`, en el momento de aceptar la
  foto. Se guarda como campos del acta: `gps.lat`, `gps.lng`, `gps.precisionM`, `gps.capturadoEn`. **Es obligatorio para registrar
  el acta**: si falla, la app ofrece «Reintentar»; si la precisión supera 100 m, se guarda con un aviso visible para el coordinador.
- **Permisos:** servicio `DevicePermissionsService` que llama a `checkPermissions()` antes de cada uso. Si el estado es `prompt`,
  pide el permiso (`requestPermissions()`); si es `denied`, muestra un mensaje que explica cómo activarlo en los ajustes de Android.
  `AndroidManifest.xml` declara `CAMERA`, `ACCESS_FINE_LOCATION` y `ACCESS_COARSE_LOCATION`.
- **Errores tratados con mensajes en español:** el usuario cancela la cámara (`User cancelled photos app`, no es un error), permiso
  denegado, GPS desactivado, tiempo de espera agotado, foto borrosa y fallo de subida.

## Consecuencias

- **Beneficios:** sin dependencias pesadas; una regla de nitidez explicable y comprobable con pruebas unitarias; fotos ligeras, aptas
  para datos móviles y para la cola offline.
- **Obligaciones:** calibrar el umbral con fotos reales y documentarlo; probar en un dispositivo físico (el emulador no tiene cámara
  real ni GPS fiable).
- **Limitaciones:** la varianza del Laplaciano también baja con poca textura (una hoja casi en blanco) y puede rechazar fotos
  válidas. Por eso hay un mensaje claro y se puede repetir la foto sin límite.
- **Riesgo:** en interiores el GPS puede no fijar posición en 15 s y bloquear el registro. **Mitigación:** permitir la última
  ubicación conocida de menos de 5 minutos (`maximumAge: 300000` en el reintento), marcada como «aproximada».

## Verificación

- Prueba unitaria `image-quality.util.spec.ts`: una imagen sintética con bordes nítidos supera el umbral; la misma imagen difuminada
  (*blur*) no lo supera.
- Prueba manual en Android (lista en el README):
  - negar el permiso de cámara → mensaje con instrucciones;
  - tomar una foto movida → rechazo;
  - desactivar la ubicación → mensaje y reintento;
  - foto nítida con GPS → el acta guarda `gps.lat/lng/precisionM`, visible en Firestore.
- `android/app/src/main/AndroidManifest.xml` contiene los tres permisos.

## Uso de IA

- **Herramienta:** Claude (Anthropic).
- **Consulta:** cómo comprobar la nitidez de una foto en Ionic sin librerías pesadas, y cómo gestionar los permisos de Capacitor.
- **Respuesta sugerida:** varianza del Laplaciano + `checkPermissions`/`requestPermissions`.
- **Aceptación / rechazo:** se aceptaron la cámara obligatoria, la varianza del Laplaciano con umbral
  inicial 100 y la gestión explícita de permisos. Se modificó la regla del GPS: la propuesta lo hacía obligatorio y, tras la
  deliberación, el acta se guarda sin ubicación con la etiqueta «Ubicación no comprobable». Se añadió el brillo mínimo 35.
- **Verificación humana:** se calibrarán el umbral (100) y el brillo mínimo (35) con fotos reales de actas
  en un dispositivo Android físico, y se registrarán los resultados en las pruebas manuales (foto borrosa rechazada; permisos de
  cámara y GPS denegados).

## Trazabilidad

- Commit del ADR: [8687660](https://github.com/NW08/Apps_GR1/commit/8687660)
- Commit de implementación: [06008cd](https://github.com/NW08/Apps_GR1/commit/06008cd) (según la decisión final ADR-003)

## Consenso del equipo

| Integrante | Postura y argumentos | Objeciones |
|---|---|---|
| Josué Ortiz | Capacitor Camera forzando la cámara (`CameraSource.Camera`), nitidez por varianza del Laplaciano (umbral inicial 100) y gestión explícita de permisos. En la reunión cambió su postura escrita (GPS obligatorio) y propuso guardar sin GPS con una etiqueta visible. | A la galería: una foto de galería puede ser fraudulenta o haber sido modificada antes; la foto debe tomarse en el momento. |
| Eduardo Ganchala | Capacitor Camera y Geolocation con nitidez por Laplaciano en canvas. Propuso permitir subir la foto desde la galería. En la reunión también cambió su postura escrita (no continuar sin GPS) y propuso guardar sin GPS con una etiqueta visible. | Ninguna |

**Desacuerdo relevante:** permitir o no la galería.

**Acuerdo final:** Capacitor Camera **solo con la cámara, sin galería**, por los requisitos y la verificación de autenticidad.
El acta se puede guardar **sin GPS** con la etiqueta «Ubicación no comprobable», porque hay lugares sin conexión ni cobertura.
Valores iniciales: `UMBRAL_NITIDEZ_POR_DEFECTO = 100` y `BRILLO_MINIMO_POR_DEFECTO = 35`. ·
**Minuto del video:** 00:18:17–00:28:09 (consenso 00:26:24–00:28:09)
