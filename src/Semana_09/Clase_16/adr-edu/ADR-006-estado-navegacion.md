# ADR-006: Se adoptó el estado con Signals en servicios (fachadas) y la navegación con guards funcionales

## Estado
Aceptado

## Fecha
2026-11-22

## Autor(es) y equipo
[Eduardo Ganchala] · Equipo [6]
## Requisitos relacionados
- R9: estrategia de manejo de estado y estados explícitos de carga, éxito, error y validación.
- R2 / R3 / R8: acceso por rol y cambio obligatorio de contraseña.

## Contexto
El estado compartido fue reducido: sesión y perfil, lista de mesas, acta en edición y avance. La interfaz debió mostrar siempre uno de los estados `cargando`, `éxito`, `error` o `validación`. Las rutas debieron proteger el acceso por rol como complemento de RLS, no como sustituto.

## Alternativas consideradas
**A. Signals de Angular dentro de servicios singleton**
- Ventajas: no requirió librerías; la API fue simple y reactiva; resultó fácil de explicar y de probar.
- Desventajas: no contó con herramientas de depuración de tiempo de viaje, y la disciplina del equipo debió evitar mutaciones dispersas.

**B. NgRx (store, efectos, selectores)**
- Ventajas: ofreció flujo unidireccional y trazabilidad.
- Desventajas: implicó mucha ceremonia para pocas entidades, una dependencia adicional y un costo de aprendizaje alto para el plazo.

**C. BehaviorSubject de RxJS**
- Ventajas: fue ampliamente conocido.
- Desventajas: requirió más código de suscripción y riesgo de fugas; los Signals lo reemplazaron con menos código.

## Decisión
Se eligió la alternativa **A**. Cada servicio de dominio expuso `signal`s de solo lectura (`asReadonly`) y métodos que los actualizaron. Un tipo común representó la carga asíncrona:

```ts
type Estado<T> =
  | { tipo: 'inactivo' }
  | { tipo: 'cargando' }
  | { tipo: 'exito'; datos: T }
  | { tipo: 'error'; mensaje: string };
```

La interfaz usó `@switch` sobre `estado().tipo` para mostrar el spinner, el contenido o el mensaje con opción de reintento. Los errores de validación se mostraron en el campo.

Navegación: se definieron rutas con `loadComponent` y los guards funcionales `authGuard`, `rolGuard(['veedor'])` y `cambioClaveGuard`. Las rutas por rol se ubicaron bajo `/provincial`, `/recinto` y `/veedor`, y tras el login se redirigió según el rol.

## Consecuencias
- Beneficios: se logró poco código y estados consistentes.
- Obligaciones: ningún componente mantuvo estado de negocio propio.
- Riesgo: sin una herramienta de depuración de estado, los errores fueron más difíciles de rastrear. Se mitigó registrando las transiciones en el `LoggerService` en modo desarrollo.

## Verificación
- Se establecieron pruebas de `rolGuard`: un veedor que navegara a `/provincial` debía ser redirigido.
- Se definió simular red lenta y error 500, y observar el spinner y el mensaje con reintento.
- Se definió que `grep -R "BehaviorSubject" src/` debía arrojar un mínimo de coincidencias o ninguna en el estado de negocio.

## Uso de IA
- Herramienta: [Gemini IA]. Se consultó la comparación de Signals, NgRx y BehaviorSubject.
- Respuesta sugerida: la herramienta recomienda utilizar Angular Signals para el estado de UI y RxJS (`BehaviorSubject`) para flujos asíncronos o sincronización, descartando NgRx por su sobrecarga para el alcance del proyecto.
- Aceptación/Rechazo: Aceptado. El equipo utilizará Signals junto con servicios inyectables y RxJS donde resulte necesario, evitando la complejidad innecesaria de NgRx. 
- Verificación humana: el equipo validará durante la implementación que los estados explícitos de UI (carga, éxito, error y vacío) responderán correctamente y mantendrán un código claro para la defensa.
## Trazabilidad
- Commit del ADR: git commit -m "docs(adr): propuestas ADR-001 a ADR-010"
- Commit de implementación: Pendiente

## Consenso del equipo
Pendiente