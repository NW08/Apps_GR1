# novaSync — Dual-Engine Messenger (Supabase + Firebase)

**novaSync** es una aplicación de mensajería móvil y web desarrollada con **Ionic 9 + Angular 22 + Capacitor 8** que integra **Supabase** y **Firebase** de forma simultánea y complementaria, asignando a cada motor la responsabilidad técnica donde mejor rinde.

---

## Arquitectura Dual-Engine

```
┌─────────────────────────────────────────────────────────────┐
│                   novaSync (Ionic + Capacitor)              │
├──────────────────────────────┬──────────────────────────────┤
│      SUPABASE (Persistencia) │    FIREBASE RTDB (Efímero)   │
├──────────────────────────────┼──────────────────────────────┤
│ • Auth (Login/Registro/Reset)│ • Presencia online/offline   │
│ • PostgreSQL + RLS           │   con onDisconnect()         │
│ • Salas públicas/privadas    │ • Indicador "escribiendo..." │
│ • Códigos NOVA-XXXX (RPC)    │ • Beacons GPS en tiempo real │
│ • Mensajes, Replies, Pin     │ • Estado de conexión en vivo │
│ • Reacciones & Storage Media │   (.info/connected)          │
└──────────────────────────────┴──────────────────────────────┘
```

---

## Funcionalidades Implementadas (14)

1. **Inicio de sesión, registro y recuperación de contraseña** (Supabase Auth).
2. **Gestión y edición completa de perfil** (nombre visible, `@handle`, bio, estado rápido y disponibilidad).
3. **Avatar personalizado** con cámara/galería o archivo subido a **Supabase Storage** (`avatars`).
4. **Creación de salas públicas y privadas** con tema y descripción.
5. **Códigos cortos de invitación (`NOVA-XXXX`)** con RPC seguro en PostgreSQL (`join_room_by_code`) para desbloquear salas privadas.
6. **Mensajería en tiempo real** con Supabase Realtime (`postgres_changes`).
7. **Envío de imágenes** con visor a pantalla completa (`chat-media/images`).
8. **Envío de archivos y documentos** (PDF, DOCX, ZIP, TXT) con tamaño formateado y descarga directa.
9. **Compartir ubicación puntual** con mapa interactivo **Leaflet + OpenStreetMap** embebido en la burbuja y enlace externo.
10. **Beacons GPS en vivo (15 min)** transmitiendo coordenadas en tiempo real mediante **Firebase RTDB** + `@capacitor/geolocation`.
11. **Presencia en línea en tiempo real** con detección automática de desconexión (`onDisconnect`) en Firebase RTDB.
12. **Indicador de escritura en vivo** (`"Usuario está escribiendo..."`) en Firebase RTDB.
13. **Respuestas citadas (Reply), mensajes fijados (Pin) y reacciones emoji** (`👍`, `🔥`, `❤️`, `😂`, `🚀`).
14. **Mensajes efímeros (TTL 1m / 5m)**, búsqueda de mensajes en sala, **modo oscuro/claro** y **feedback háptico nativo** (`@capacitor/haptics`).

---

## Configuración Rápida

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar Supabase
1. Crea un proyecto en [Supabase](https://supabase.com).
2. Abre **SQL Editor** y ejecuta el contenido completo de [`supabase/schema.sql`](supabase/schema.sql).
   - Esto crea las tablas `profiles`, `rooms`, `room_members`, `messages`, `message_reactions`, las políticas RLS, el trigger `handle_new_user`, la función `join_room_by_code`, los buckets `avatars` y `chat-media`, y habilita `supabase_realtime`.
3. Copia tu **Project URL** y **anon public key** en `src/environments/environment.ts` y `src/environments/environment.prod.ts`.

### 3. Configurar Firebase
1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com).
2. Habilita **Realtime Database** y aplica las reglas de [`firebase/database.rules.json`](firebase/database.rules.json).
3. Registra una App Web y copia la configuración (`apiKey`, `databaseURL`, `projectId`, etc.) en `src/environments/environment.ts` y `src/environments/environment.prod.ts`.

---

## Ejecución y Despliegue

### Desarrollo local (Web)
```bash
npm start
```

### Build de producción (Web)
```bash
npm run build
```
Despliega la carpeta `www/` en **Vercel**, **Netlify** o **Firebase Hosting**.

### Generar APK funcional (Android con Capacitor)
```bash
npm run build
npx cap add android
npx cap sync android
npx cap open android
```
En Android Studio: **Build → Build Bundle(s) / APK(s) → Build APK(s)** (recuerda verificar permisos de `CAMERA`, `ACCESS_FINE_LOCATION` e `INTERNET` en `android/app/src/main/AndroidManifest.xml`).

---

## Guía para Pruebas en Parejas y Video Demostrativo

1. **Usuario A y Usuario B** se registran desde dispositivos distintos (Web + APK Android).
2. **Usuario A** edita su perfil, sube avatar y crea una **Sala Privada**; comparte el código `NOVA-XXXX`.
3. **Usuario B** se une usando **Código NOVA**, verifica el indicador de presencia en línea y escribe (se ve *"escribiendo..."* en vivo).
4. Intercambian texto, imagen, archivo PDF, reacción emoji, mensaje fijado, mensaje efímero de 1 min, ubicación en mapa y **Beacon GPS en vivo**.
