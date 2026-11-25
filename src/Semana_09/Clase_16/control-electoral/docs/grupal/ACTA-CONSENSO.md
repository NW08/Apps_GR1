# Acta de consenso — Equipo 6

**Integrantes:** Eduardo Ganchala · Josué Ortiz
**Fecha de la reunión:** 2026-11-24 · **Hora de inicio:** 20:30 · **Duración del video:** 01:24:55 · **Plataforma:** Discord
**Enlace al video íntegro:** https://youtu.be/Yn3_Y0NRamQ
**Documento de ADR definitivos:** [ADR-CONSOLIDADO.md](ADR-CONSOLIDADO.md) (un archivo por decisión en `../adr/`)

Todos los integrantes reconocen esta línea base y documentarán cualquier sustitución mediante un nuevo ADR.

## Acuerdos por ADR

| ADR | Alternativas presentadas (por quién) | Desacuerdos relevantes | Acuerdo final | Estado | Minuto del video |
|---|---|---|---|---|---|
| ADR-001 Framework | Eduardo Ganchala: Ionic Angular standalone<br>Josué Ortiz: Ionic Angular standalone | Ninguno | Ionic Angular standalone con Capacitor; se prioriza el framework usado en todo el curso. | Aceptado (propuesta común) | 00:00:43–00:05:06 |
| ADR-002 Backend | Eduardo Ganchala: Supabase<br>Josué Ortiz: Firebase | El plan Blaze de Firebase (de pago) para Cloud Functions | Supabase: no se vio factible gastar dinero habiendo opciones gratuitas y comunitarias. | Aceptado (ADR de Eduardo Ganchala) | 00:05:21–00:18:06 |
| ADR-003 Cámara, GPS, nitidez | Eduardo Ganchala: Capacitor Camera y Geolocation, Laplaciano; permitir la galería<br>Josué Ortiz: Capacitor Camera solo con cámara, Laplaciano | Permitir o no la galería | Solo cámara, sin galería (una foto de galería puede ser fraudulenta o estar modificada). Guardar sin GPS con la etiqueta «Ubicación no comprobable» (lugares sin conexión; ambos lo propusieron). Umbral de nitidez 100 y brillo mínimo 35 con el algoritmo Laplaciano. | Aceptado con modificaciones (ADR de Josué Ortiz) | 00:18:17–00:28:09 |
| ADR-004 Arquitectura | Eduardo Ganchala: capas organizadas por tipo técnico<br>Josué Ortiz: capas con carpetas por funcionalidad y repositorios | Ninguno | Arquitectura por capas organizada por funcionalidad y repositorios: más fácil de defender, de identificar el código y de saber dónde modificar. | Aceptado (ADR de Josué Ortiz) | 00:28:10–00:38:29 |
| ADR-005 Estado, formularios, navegación | Eduardo Ganchala: Signals en servicios, guards funcionales y formularios reactivos<br>Josué Ortiz: Signals, Reactive Forms tipados, guardas por rol y errores tipados | Ninguno | Signals con errores tipados y guards; las propuestas de Eduardo sobre estado y formularios quedan integradas. | Aceptado (ADR de Josué Ortiz) | 00:38:30–00:47:02 |
| ADR-006 Offline (opcional) | Eduardo Ganchala: Dexie (IndexedDB), cola de pendientes y control de versiones<br>Josué Ortiz: caché de Firestore, cola de fotos y conflictos por versión | Ninguno: la caché de Firestore no aplica al no usar Firebase | IndexedDB con Dexie para la cola y `@capacitor/filesystem` para las fotos; R10 es opcional e individual. | Aceptado (ADR de Eduardo Ganchala) | 01:17:30–01:24:44 |
| ADR-007 Cuentas y roles | Eduardo Ganchala: Supabase Auth, Edge Functions y login por cédula con RPC<br>Josué Ortiz: Cloud Functions y *custom claims* | Ninguno: se presentó dentro del bloque del backend y se resolvió al elegir Supabase | Se adopta la propuesta de Eduardo; la de Josué quedó fuera de alcance al no usar Firebase. | Aceptado (ADR de Eduardo Ganchala) | 00:12:20–00:15:41 |
| ADR-008 Modelo y reglas | Eduardo Ganchala: modelo relacional normalizado, Storage privado y RLS; vistas<br>Josué Ortiz: reglas por rol y pertenencia; triggers | Estado de las mesas y consultas: vistas (Eduardo) o triggers (Josué) | Esquema normalizado con votos en tabla hija y siembra de datos fijos conocidos; el estado de la mesa se guarda al registrar el acta (no se calcula en cada consulta); vistas para las consultas más pesadas, junto con índices. | Aceptado (ADR de Eduardo Ganchala) | 00:47:03–00:58:01 |
| ADR-009 Dashboard | Eduardo Ganchala: agregación en el servidor, refresco y barras sin librería; OpenStreetMap para el mapa<br>Josué Ortiz: agregaciones en el servidor con Chart.js; no contar las actas observadas | Cómo mostrar las actas observadas (Josué: contarlas implica costos de lectura y escritura) | Contar las actas observadas marcadas, con un filtro para excluirlas; mapa con la API pública de OpenStreetMap. | Aceptado con modificaciones (ADR de Eduardo Ganchala) | 00:58:02–01:09:51 |
| ADR-010 Pruebas y errores | Eduardo Ganchala: pruebas por capas, errores centralizados y monitoreo ligero<br>Josué Ortiz: pruebas en tres niveles | Qué es lo mínimo que hay que probar | Tres niveles orientados a Supabase; Josué propuso el nivel 3 (pruebas manuales sobre el APK final) y Eduardo estuvo de acuerdo. | Aceptado (ADR de Josué Ortiz) | 01:09:52–01:17:29 |

## Línea base tecnológica común (resumen)

| Elemento | Acordado |
|---|---|
| Framework | Ionic Angular standalone + Capacitor, solo Android (ADR-001) |
| Versiones (Node / Angular / Ionic / Capacitor) | Node 26.x · Angular 22.3.x (TypeScript 6.0.x) · Ionic 9.0.x · Capacitor 8.6.x, compilado con JDK 21. No se fijaron en la reunión; se adoptan las estables vigentes al 2026-11-25 (ADR-001). |
| Backend y plan | Supabase, plan Free, un proyecto por integrante (ADR-002) |
| Plugins de Capacitor | `@capacitor/camera`, `@capacitor/geolocation`; para R10: `@capacitor/filesystem`, `@capacitor/network` |
| Estado y formularios | Signals con errores tipados, Reactive Forms tipados y guardas funcionales (ADR-005) |
| Implementación de R10 | Individual y opcional (ADR-006) |

## Firmas o conformidad

| Integrante | Conformidad (sí/no) | Observaciones |
|---|---|---|
| Eduardo Ganchala | Sí | Ninguna |
| Josué Ortiz | Sí | Ninguna |
