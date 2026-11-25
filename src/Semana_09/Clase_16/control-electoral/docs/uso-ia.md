# Anexo: uso de inteligencia artificial

Estudiante: **Josué Ortiz** · Equipo 6 · Prueba 2 (Control electoral)

## Herramientas

| Herramienta | Uso |
|---|---|
| Claude (Anthropic) | Borradores de los ADR individuales, comparación de alternativas, generación y revisión de código (Angular, SQL, Edge Functions), diagnóstico de errores de compilación y redacción de la documentación. |
| Gemini (usado por Eduardo Ganchala) | Sus propuestas de ADR; quedan citadas en los ADR finales que provienen de él. |

## Ejemplos de consultas

1. «Crea los ADR para el examen; planeo usar Angular standalone, Ionic, Capacitor, Android Studio y Firebase». Generó los 10
   borradores de `adr-mio/` con alternativas A/B/C.
2. «Revisa todo lo que me falta según `exam.md`, el acta y los ADR». Produjo la lista de entregables pendientes y detectó la fila del
   ADR-007 vacía y la contradicción de la galería en el acta.
3. «Toma los tiempos del video desde `subtitles.vtt`». Extrajo el índice de minutos por ADR del acta.
4. Implementación por capas siguiendo los ADR finales: migración SQL con RLS, Edge Functions de cuentas, reglas de dominio con
   pruebas, servicios de cámara y GPS, pantallas por rol y tema visual.

## Qué se aceptó, qué se descartó y qué se corrigió

| Sugerencia de la IA | Resultado | Motivo |
|---|---|---|
| Backend Firebase con plan Blaze | **Descartada** | En la deliberación se eligió Supabase: Blaze tiene costo y hay opciones gratuitas (ADR-002). |
| Login con correo sintético `cedula@dominio` | **Descartada** | Rompe la recuperación por correo; se usa la RPC `email_por_cedula` (ADR-007). |
| GPS obligatorio para guardar el acta | **Modificada** | Se acordó guardar sin GPS con la etiqueta «Ubicación no comprobable» (ADR-003). |
| Gráficos con Chart.js | **Descartada** | Barras con CSS puro, sin dependencias (ADR-009). |
| Estado de la mesa calculado en una vista | **Corregida** | La transcripción del video (00:57:41) muestra que se acordó guardarlo; se añadió la migración 002 con trigger. |
| ADR-007 «sin discusión» en el acta | **Corregida** | El video muestra que se presentó dentro del bloque del backend (00:12:20–00:15:41). |
| Comentarios extensos en el código | **Corregida** | Se dejaron solo comentarios breves donde el código no se explica solo. |
| Símbolos y emojis en mensajes de consola | **Corregida** | Se reemplazaron por texto plano (`[OK]`, `[FALLA]`). |
| Paleta azul en el login | **Corregida** | Se cambió a una paleta oscura con blanco hueso, gris y beige. |
| Barras con `color="primary"` | **Corregida** | Con el tema oscuro los títulos quedaban negros sobre fondo oscuro. |
| Gradle 8.14 generado por Capacitor | **Corregida** | El JBR 25 de Android Studio exige Gradle 9.1+; se fijó el wrapper en 9.1.0 y se verificó con JDK 21 y con JBR 25. |

## Cómo se validó

- **Compilación:** `npx ng build` sin errores; APK generado con `./gradlew assembleDebug` usando Temurin 21 y verificado también
  con el JBR 25 de Android Studio.
- **Pruebas unitarias:** `npm run test:unit` (cédula, consistencia del acta y nitidez) en verde.
- **Seguridad (R8):** `npm run test:rls` se ejecuta contra el proyecto real de Supabase con las cuentas de demostración, solo con la
  publishable key.
- **Verificación manual:** login con cédula, denegación con credenciales incorrectas, cambio de contraseña, creación de veedores y
  asignación de mesas probados en el navegador; lista completa en [`pruebas-manuales.md`](pruebas-manuales.md).
- **Diagnóstico:** al fallar el primer login se comprobó con la publishable key que la RPC no devolvía el perfil; el bloque de la
  siembra no había insertado la fila y se corrigió con una consulta que ignora mayúsculas.

## Límites

La IA no tuvo acceso a la consola de Supabase ni al teléfono: la creación del proyecto, la ejecución del SQL, la cuenta inicial y
las pruebas en el dispositivo las hizo el estudiante. Todo el código fue revisado y puede explicarse y modificarse en la defensa.
