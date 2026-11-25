# ADR-007: Se adoptaron formularios reactivos con validadores propios y reglas de negocio en servicios

## Estado
Aceptado
## Fecha
2026-11-22

## Autor(es) y equipo
[Eduardo Ganchala] · Equipo [6]
## Requisitos relacionados
- R2: cédula ecuatoriana validada, nombres, apellidos, teléfono y correo.
- R3: cambio obligatorio de contraseña.
- R6: consistencia de totales del acta y correcciones.

## Contexto
Existieron dos tipos de validación: de campo (formato) y de regla de negocio (la suma de votos más nulos y blancos debió igualar el total de sufragantes). La regla de totales se ejecutó en la app para dar respuesta inmediata y en la base de datos (ADR-004) como segunda barrera. Los criterios fueron la reutilización, las pruebas unitarias y los mensajes claros.

## Alternativas consideradas
**A. Formularios reactivos de Angular con validadores personalizados (funciones puras) y servicio de reglas**
- Ventajas: no requirió dependencias; los validadores fueron reutilizables y probables; un validador de grupo resolvió la suma de totales.
- Desventajas: implicó más código que los formularios de plantilla.

**B. Formularios dirigidos por plantilla (`ngModel`)**
- Ventajas: requirieron menos código en formularios simples.
- Desventajas: la validación cruzada fue difícil de expresar y de probar.

**C. Librería externa de esquemas (Zod/Yup) adaptada a Angular**
- Ventajas: permitió un esquema único.
- Desventajas: añadió una dependencia sin integración nativa con Angular.

## Decisión
Se eligió la alternativa **A**.
- Se creó `cedulaEcuatorianaValidator` (shared/validators): 10 dígitos, provincia 01–24 (o 30), tercer dígito menor que 6 y dígito verificador por módulo 10 con coeficientes 2,1,2,1,2,1,2,1,2 (restando 9 si el producto superaba 9).
- Se crearon validadores de teléfono (10 dígitos con prefijo 09 para móviles), correo y contraseña nueva (mínimo 8 caracteres y distinta de la inicial `Ecuador2026`).
- Se creó `totalesActaValidator` (de grupo): votos de cinco organizaciones + nulos + blancos = total de sufragantes, con entradas enteras y no negativas. Mostró la diferencia calculada.
- Las reglas de negocio (por ejemplo, "el veedor solo registra mesas asignadas" y "no duplicar acta por mesa y dignidad") residieron en `ActaService` y no en la página.
- Los errores se presentaron por campo, con texto en español, y los errores del servidor se mapearon a mensajes (ADR-008).

## Consecuencias
- Beneficios: la validación quedó probada y fue reutilizable.
- Obligaciones: se debieron mantener alineados el validador de la app y el trigger de la base de datos.
- Riesgo: ambos pudieron divergir y la app aceptar lo que la base rechazaba. Se mitigó con una prueba que envió el mismo caso inválido a ambos.

## Verificación
- Se establecieron pruebas unitarias con cédulas válidas e inválidas conocidas, y con totales correctos e incorrectos.
- Se definió que, en la app, ingresar totales que no sumaran debía bloquear el guardado y mostrar la diferencia.
- Se definió que intentar guardar un acta incoherente directamente por la API debía devolver el error del trigger.

## Uso de IA
- Herramienta: [Gemini IA]. Se consultó el algoritmo de validación de cédula ecuatoriana y el validador de grupo.
- Respuesta sugerida: la herramienta sugiere implementar el algoritmo de módulo 10 para validar cédulas ecuatorianas y un validador de grupo (`ValidatorFn`) en `ReactiveFormsModule` para comprobar la suma de votos contra el total de sufragantes. 
- Aceptación/Rechazo: Aceptado. El equipo incorporará ambos validadores síncronos en los formularios reactivos de la aplicación.
- Verificación humana: el equipo ejecutará pruebas unitarias con cédulas válidas, inválidas y de longitud incorrecta, y verificará que el validador de grupo detectará inconsistencias al modificar los campos de votos.
## Trazabilidad
- Commit del ADR: git commit -m "docs(adr): propuestas ADR-001 a ADR-010"
- Commit de implementación: Pendiente

## Consenso del equipo
Pendiente