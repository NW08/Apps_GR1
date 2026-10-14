# Ionic & Android Studio || `CLASE 03 (08|10|2026)`

Se realizó este proyecto como práctica formativa en la materia de Desarrollo de Aplicaciones Móviles mediante **Ionic**, **Angular** y **Capacitor**, implementando una aplicación interactiva centrada en el registro de información de usuario, el control de un contador numérico dinámico y la gestión reactiva de estado global entre pestañas mediante **Angular Signals** y un servicio centralizado (`DatosService`), bajo una estética minimalista en tonalidades blanco, negro y gris adaptable a dispositivos móviles.

---

## Cómo Instalar y Ejecutar

### Prerrequisitos

Antes de empezar, asegúrate de contar con el entorno base:

| Herramienta                                            | Versión recomendada                                       |
| ------------------------------------------------------ | --------------------------------------------------------- |
| [Node.js](https://nodejs.org/)                         | v20.x o LTS vigente                                       |
| [npm](https://www.npmjs.com/)                          | v10.x o superior                                          |
| [Ionic CLI](https://ionicframework.com/docs/intro/cli) | Incluido en dependencias o global (`npm i -g @ionic/cli`) |
| [Visual Studio Code](https://code.visualstudio.com/)   | Editor de código recomendado                              |

---

### Pasos

1. **Clona el repositorio y navega al directorio de la clase**

```bash
git clone https://github.com/NW08/Apps_GR1.git
cd Apps_GR1/src/Clase_03
```

_(o `cd src/Clase_03` si ya estás dentro del repositorio)_

2. **Instala Ionic CLI (dependencias raíz)**

En la carpeta raíz `Clase_03`, ejecuta la primera instalación para tener Ionic CLI disponible:

```bash
npm install
```

3. **Ingresa a la carpeta `contador` e instala las dependencias de la aplicación**

Entra al directorio del proyecto `contador` y vuelve a ejecutar la instalación para descargar Angular, Capacitor y los componentes de Ionic:

```bash
cd contador
npm install
```

4. **Ejecuta el servidor de desarrollo local**

Dentro del directorio `contador`, inicia la aplicación:

```bash
ionic serve
```

> **Nota:** Si no tienes Ionic instalado de forma global en tu equipo, también puedes iniciar el servidor con `npx ionic serve`.

5. **Visualiza la aplicación**

- La aplicación se abrirá automáticamente en tu navegador en `http://localhost:8100/`.
- Presiona `F12` en el navegador y activa el modo dispositivo móvil (**Toggle Device Toolbar**) para probar la experiencia móvil.

---

## Vista General del Proyecto

Esta aplicación móvil presenta una interfaz interactiva y minimalista desarrollada con **Ionic Framework** y **Angular (Standalone Components) / TypeScript**. La arquitectura está estructurada en torno a un servicio reactivo singleton que comparte estado global entre dos vistas principales (Registro y Resumen):

| Componente / Archivo | Responsabilidad                                                                                                                                                                                                                                           |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `datos.ts`           | Servicio reactivo (`DatosService`) que gestiona el estado global mediante Angular Signals (`nombre_usuario`, `correo_electronico`, `numero_paralelo`, `valor_contador`, `datos_enviados`) y métodos de actualización (`guardar_datos`, `reiniciar_datos`) |
| `tab1.page.ts`       | Controlador de la vista de registro: gestión de entradas en `snake_case`, operaciones del contador (`aumentar_contador`, `disminuir_contador`, `reiniciar_contador`), validación de datos y redirección al resumen                                        |
| `tab1.page.html`     | Estructura visual dividida en tarjetas minimalistas para datos de usuario, display numérico del contador, botones de control e indicador de alertas                                                                                                       |
| `tab1.page.scss`     | Diseño visual minimalista en paleta sobria (blanco, negro y gris), tipografía refinada, microinteracciones táctiles y soporte automático para modo oscuro                                                                                                 |
| `tab2.page.ts`       | Controlador de la vista de resumen: lectura reactiva de `DatosService` y acciones de navegación para volver a editar o limpiar datos                                                                                                                      |
| `tab2.page.html`     | Presentación del resumen con tarjeta de usuario, desglose de datos registrados, bloque numérico destacado del contador y estado vacío (`empty state`) condicional                                                                                         |
| `tab2.page.scss`     | Estilos visuales minimalistas para el resumen, avatar monocromático, separadores sutiles y diseño del estado vacío                                                                                                                                        |
| `tabs.page.ts`       | Controlador del contenedor de pestañas con inyección de dependencias e inicialización de iconos sobrios (`Ionicons`)                                                                                                                                      |
| `tabs.page.html`     | Barra de navegación inferior (`ion-tab-bar`) configurada con accesos a `Registro` y `Resumen`                                                                                                                                                             |
| `tabs.page.scss`     | Estilizado minimalista de la barra de navegación con acentos monocromáticos y bordes sutiles                                                                                                                                                              |
| `tabs.routes.ts`     | Configuración de enrutamiento principal con carga diferida (`loadComponent`) y redirección inicial hacia `tab1`                                                                                                                                           |
| `global.scss`        | Configuración de estilos globales y compatibilidad nativa con el modo oscuro del sistema operativo (`dark.system.css`)                                                                                                                                    |

---

## Características Implementadas

- **Gestión reactiva de estado con Angular Signals:** Uso de la API nativa de Signals en `DatosService` para almacenar y emitir los cambios de estado en tiempo real entre las pestañas sin necesidad de suscripciones manuales a observables.
- **Contador interactivo dinámico:** Funcionalidades de incremento secuencial, decremento controlado (con protección para no descender de 0) y reinicio instantáneo a cero.
- **Formulario con validación en español `snake_case`:** Captura organizada de nombre completo, correo electrónico y paralelo académico, con validación de campos obligatorios y despliegue de mensajes de alerta sobrios.
- **Diseño visual minimalista monocromático:** Interfaz basada estrictamente en tonalidades blanco, negro y gris con contrastes balanceados, bordes delgados de 1px, tipografía limpia y sin elementos sobrecargados.
- **Soporte completo para Modo Claro y Oscuro:** Adaptabilidad nativa mediante media queries de CSS (`prefers-color-scheme`) e integración con el sistema de paletas de Ionic.
- **Navegación fluida y redirección programática:** Enlace directo entre el registro y el resumen utilizando el servicio `Router` de Angular al completar el envío.
- **Manejo de Estado Vacío (Empty State):** Vista amigable y elegante en el resumen cuando aún no existen datos sincronizados, guiando al usuario de regreso a la pestaña de registro.
- **Nomenclatura semántica estandarizada:** Variables y funciones con nombres descriptivos en español utilizando la convención `snake_case`.
