# ADR-005: Se adoptaron Capacitor Camera y Geolocation con comprobación de nitidez en el cliente

## Estado
Rechazado

## Fecha
2026-11-22

## Autor(es) y equipo
[Eduardo Ganchala] · Equipo [6]
## Requisitos relacionados
- R7: fotografía del acta, comprobación de nitidez antes de aceptarla, GPS como campos del registro y gestión de permisos y errores.
- Sección 10: Capacitor y compilación para Android.

## Contexto
La foto del acta fue la evidencia del resultado. Una imagen borrosa o muy pesada volvió inútil la evidencia o hizo lenta la subida con datos móviles. El GPS debió guardarse como campos (`lat`, `lng`, `precision_m`) y no como metadatos de la imagen. Hubo que cubrir permiso denegado, denegado permanentemente, GPS apagado y tiempo de espera agotado.

## Alternativas consideradas
**A. `@capacitor/camera` + `@capacitor/geolocation` + nitidez por varianza del Laplaciano en canvas**
- Ventajas: usó plugins oficiales sin dependencias nativas extra; la métrica fue determinista, explicable y se ejecutó sin red.
- Desventajas: el umbral dependió del dispositivo y de la iluminación, y no detectó todos los casos (por ejemplo, el desenfoque parcial).

**B. Cámara con ML (ML Kit u OpenCV nativo)**
- Ventajas: la detección fue más precisa y permitió detectar los bordes del documento.
- Desventajas: requirió un plugin de terceros, aumentó el tamaño del APK y presentó riesgo de incompatibilidad con la versión de Capacitor.

**C. `<input type="file" capture>`**
- Ventajas: no tuvo dependencias.
- Desventajas: no gestionó los permisos de forma uniforme, no integró el flujo de reintento y no correspondió a lo que pidió el enunciado (Capacitor).

## Decisión
Se eligió la alternativa **A**.
- Se utilizó `Camera.getPhoto({ resultType: Uri/DataUrl, quality: 80, width: 1600 })`; antes se llamó a `Camera.checkPermissions()` y `requestPermissions()`.
- Nitidez: la imagen se redujo a unos 800 px de ancho en un `canvas`, se convirtió a gris, se aplicó el kernel Laplaciano y se calculó la varianza; si resultó menor al umbral configurable (valor inicial por calibrar con fotos reales de actas), se mostró "Foto borrosa: repetir" y no se aceptó. La función residió en `shared/utils/sharpness.ts` y fue pura, por lo que se probó con imágenes de ejemplo.
- GPS: se usó `Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 })` y se guardaron `lat`, `lng` y `precision`.
- Errores: un `PermissionService` tradujo cada código de error a un mensaje y a una acción (abrir ajustes, reintentar); no se permitió continuar sin GPS, porque el registro requirió ubicación.
- `AndroidManifest.xml` declaró `CAMERA`, `ACCESS_FINE_LOCATION` y `ACCESS_COARSE_LOCATION`.

## Consecuencias
- Beneficios: se logró un flujo guiado con reintento y una evidencia consistente y de tamaño acotado.
- Obligaciones: se debió calibrar el umbral y documentarlo en el README.
- Riesgos: hubo posibilidad de falsos rechazos o falsos aceptados según la luz. Se mitigó con un umbral configurable y un mensaje claro, sin bloquear tras varios intentos fallidos (el coordinador de recinto pudo corregir la foto, R5).

## Verificación
- Se establecieron pruebas unitarias de `sharpness.ts` con una foto nítida y otra desenfocada.
- Se definió, en un dispositivo Android: denegar la cámara debía mostrar un mensaje y el botón de ajustes; apagar el GPS debía mostrar un mensaje de error; una foto movida debía ser rechazada.
- Se definió comprobar en la base de datos que `lat`, `lng` y `precision_m` quedaran guardados.

## Uso de IA
- Herramienta: [Gemini IA]. Se consultó el método de detección de borrosidad en el cliente y el manejo de permisos.
- Respuesta sugerida: la herramienta recomienda evaluar la nitidez localmente en el cliente (por ejemplo, mediante la varianza del Laplaciano en canvas) y solicitar o verificar explícitamente los permisos de cámara y GPS con Capacitor. 
- Aceptación/Rechazo: Aceptado parcialmente. El equipo integrará la detección local de borrosidad y la gestión explícita de permisos de hardware, y ajustará el umbral de nitidez tras las pruebas en dispositivo. 
- Verificación humana: el equipo realizará pruebas en Android con `@capacitor/camera` y `@capacitor/geolocation` utilizando fotos nítidas, borrosas y escenarios de permisos denegados.

## Trazabilidad
- Commit del ADR: git commit -m "docs(adr): propuestas ADR-001 a ADR-010"
- Commit de implementación: Pendiente

## Consenso del equipo
Pendiente
