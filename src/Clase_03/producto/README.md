# Ionic: Registro de Compra y Pago (Deber) || `CLASE 03 (08|10|2026)`

Aplicación móvil desarrollada con **Ionic**, **Angular (Standalone Components)** y **Capacitor** para gestionar la compra de un producto y el cálculo de su liquidación de pago. Implementa validación estricta de formularios, cálculos reactivos mediante **Angular Signals**, íconos personalizados por pestaña, soporte de assets con `@capacitor/assets` y pantalla de bienvenida con imagen.

---

## Cómo Instalar y Ejecutar

### Prerrequisitos

| Herramienta                                            | Versión recomendada                                       |
| ------------------------------------------------------ | --------------------------------------------------------- |
| [Node.js](https://nodejs.org/)                         | v20.x o LTS vigente                                       |
| [npm](https://www.npmjs.com/)                          | v10.x o superior                                          |
| [Ionic CLI](https://ionicframework.com/docs/intro/cli) | Incluido en dependencias o global (`npm i -g @ionic/cli`) |
| [Visual Studio Code](https://code.visualstudio.com/)   | Editor de código recomendado                              |

---

### Pasos

1. **Navega al directorio del proyecto**

```bash
cd src/Clase_03/producto
```

2. **Instala las dependencias**

```bash
npm install
```

3. **Genera los íconos y splash screen con `@capacitor/assets` (opcional)**

Coloca tus archivos fuente (`logo.png`, `splash.png`) dentro de la carpeta `assets/` y ejecuta:

```bash
npx @capacitor/assets generate
```

4. **Inicia el servidor de desarrollo local**

```bash
ionic serve
```

> **Nota:** Si no tienes Ionic de forma global, puedes ejecutar `npx ionic serve`.

5. **Visualiza la aplicación**

- Abre en tu navegador `http://localhost:8100/`.
- Presiona `F12` y activa el modo móvil (**Toggle Device Toolbar**).

---

## Vista General del Proyecto

| Componente / Archivo         | Responsabilidad                                                                                                                                                                                                                   |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `compra.service.ts`          | Servicio centralizado con Signals (`nombre_producto`, `cantidad`, `precio_unitario`, `descuento_porcentaje`, `dinero_recibido`) y valores computados (`subtotal`, `monto_descuento`, `total_final`, `cambio`, `saldo_pendiente`). |
| `tab1.page.ts / html / scss` | Pantalla de **Inicio** con ícono `storefront-outline`, imagen de portada (`assets/images/inicio.jpg`) con fallback automático y acceso directo al flujo de compra.                                                                |
| `tab2.page.ts / html / scss` | Pestaña de **Compra** con ícono `cart-outline`. Formulario para nombre, cantidad y precio unitario con validaciones en tiempo real y previsualización de subtotal.                                                                |
| `tab3.page.ts / html / scss` | Pestaña de **Pago** con ícono `cash-outline`. Muestra subtotal recibido, solicita descuento porcentual y dinero recibido, calculando total final, cambio o saldo pendiente.                                                       |
| `tabs.page.ts / html / scss` | Barra de navegación inferior con íconos temáticos para cada vista.                                                                                                                                                                |
| `tabs.routes.ts`             | Definición de rutas principales (`inicio`, `compra`, `pago`) y redirecciones.                                                                                                                                                     |
| `assets/`                    | Carpeta raíz para recursos fuente de `@capacitor/assets` y capturas de evidencias.                                                                                                                                                |

---

## Reglas y Validaciones Implementadas

- **Pestaña Compra:**

  - **Nombre del producto:** Obligatorio (no se permiten campos vacíos ni únicamente espacios).
  - **Cantidad:** Número entero estrictamente mayor que cero (`Number.isInteger(cant) && cant > 0`).
  - **Precio unitario:** Valor numérico mayor que cero (`precio > 0`).
  - Al validar correctamente, almacena los datos en el servicio y navega a la pestaña de Pago.

- **Pestaña Pago:**
  - **Descuento porcentual:** Valor numérico comprendido entre `0` y `100%`.
  - **Dinero entregado:** Valor numérico mayor o igual a cero (`>= 0`).
  - **Cálculo de cambio / saldo pendiente:**
    - Si `dinero_recibido >= total_final`: Despliega el **cambio a entregar** con estado exitoso.
    - Si `dinero_recibido < total_final`: Despliega el **saldo pendiente por pagar** con estado de advertencia.
  - **Control de estado vacío:** Si no hay compra activa, presenta una guía para volver a la pestaña de compra.

---

## Evidencias de la Aplicación

A continuación se presentan los espacios para las capturas de pantalla del flujo de la aplicación (los archivos se cargan desde la carpeta `assets/`):

### 1. Pantalla de Inicio y Pestaña de Compra

|                  Pantalla de Inicio                  |                  Pestaña de Compra                  |
| :--------------------------------------------------: | :-------------------------------------------------: |
| ![Pantalla de Inicio](assets/01_pantalla_inicio.png) | ![Pestaña de Compra](assets/02_pantalla_compra.png) |

---

### 2. Validaciones de Formulario y Pestaña de Pago

|                    Validaciones en Compra                    |         Liquidación y Descuento en Pago         |
| :----------------------------------------------------------: | :---------------------------------------------: |
| ![Validaciones en Compra](assets/03_validaciones_compra.png) | ![Pestaña de Pago](assets/04_pantalla_pago.png) |

---

### 3. Resultados de Pago: Saldo Pendiente y Cambio Entregado

|         Saldo Pendiente (Pago Incompleto)         |          Cambio a Entregar (Pago Cubierto)          |
| :-----------------------------------------------: | :-------------------------------------------------: |
| ![Saldo Pendiente](assets/05_saldo_pendiente.png) | ![Cambio Entregado](assets/06_cambio_entregado.png) |
