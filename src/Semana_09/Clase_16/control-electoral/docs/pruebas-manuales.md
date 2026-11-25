# Nivel 3 · Lista de Pruebas Manuales en Android (`ADR-010`)

- **Dispositivo físico:** Redmi Note 12
- **Versión Android:** Android 15
- **Fecha de ejecución:** 2026-11-25
- **APK probado:** `app-debug.apk` (raíz del proyecto)

| # | Caso de prueba | Pasos | Resultado esperado | Estado | Evidencia |
|---|---|---|---|---|---|
| 1 | **Login con cédula (R3)** | Ingresar cédula válida y contraseña inicial `Ecuador2026`. | Autentica vía RPC `email_por_cedula` y redirige a `/auth/cambiar-clave`. | [ ] | `docs/evidencias/01-login.png` |
| 2 | **Cambio obligatorio de contraseña (R3)** | Intentar navegar atrás o ingresar `Ecuador2026` como nueva clave; luego ingresar clave ≥ 8 chars. | Bloquea acceso hasta cambiar; luego redirige al panel del rol. | [ ] | `docs/evidencias/02-cambio-clave.png` |
| 3 | **Recuperación por correo (R3)** | Abrir `¿Olvidaste tu contraseña?` e ingresar correo registrado. | Muestra confirmación y llega correo de recuperación. | [ ] | `docs/evidencias/03-recuperar.png` |
| 4 | **Jerarquía de cuentas (R2/R4/R5)** | Provincial crea coordinador de recinto; coordinador crea veedor con cédula válida. | Ambos se crean vía Edge Function sin `service_role` en cliente, con clave inicial `Ecuador2026`. | [ ] | `docs/evidencias/04-cuentas.png` |
| 5 | **Asignación y reasignación de JRV (R5)** | En `/recinto/mesas`, asignar un veedor a JRV #1 y luego reasignar a otro veedor. | La JRV cambia de veedor y desaparece de la lista del veedor anterior. | [ ] | `docs/evidencias/05-asignacion.png` |
| 6 | **Acta consistente, inconsistente y observada (R6)** | Ingresar votos que no cuadren → intenta guardar; luego marcar inconsistencia + observación ≥ 10 chars; luego corregir para que cuadre. | Bloquea sin observación; guarda como `OBSERVADA` con observación; al corregir pasa a `CORREGIDA` (v2). | [ ] | `docs/evidencias/06-acta.png` |
| 7 | **Foto borrosa rechazada (R7)** | Tomar foto desenfocada o tapando el lente. | El algoritmo Laplaciano rechaza la foto indicando varianza/brillo insuficiente y permite repetir. | [ ] | `docs/evidencias/07-nitidez.png` |
| 8 | **Permisos cámara y GPS denegados (R7)** | Denegar permiso de cámara (muestra instrucciones de Ajustes) y apagar GPS. | Permite guardar acta etiquetada como **«Ubicación no comprobable»**. | [ ] | `docs/evidencias/08-permisos.png` |
| 9 | **Aislamiento de veedor (R8)** | Veedor A intenta abrir ruta `/veedor/acta/<jrv-de-veedor-B>/alcalde` o `/provincial/dashboard`. | `rolGuard` redirige en UI y Supabase RLS devuelve 0 filas / permiso denegado en API. | [ ] | `docs/evidencias/09-rls.png` |
| 10 | **Dashboard provincial y mapa GPS (R4)** | Como provincial, consultar consolidado y por recinto, activar toggle «Excluir actas observadas» y abrir pestaña Mapa GPS. | Barras CSS y tabla actualizan totales; mapa OpenStreetMap muestra pines y lista muestra actas sin GPS. | [ ] | `docs/evidencias/10-dashboard.png` |

> El caso de modo avión y sincronización (R10) no aplica: el componente offline es opcional y no se implementó (ADR-006).
