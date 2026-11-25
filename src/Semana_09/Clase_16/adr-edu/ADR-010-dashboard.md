# ADR-010: Se adoptó un dashboard con agregación en el servidor, actualización por refresco y gráficos sin librería externa

## Estado
Aceptado

## Fecha
2026-11-22

## Autor(es) y equipo
[Eduardo Ganchala] · Equipo [6]

## Requisitos relacionados
- R4: el coordinador provincial consultó el avance de actas, las coordenadas GPS y un dashboard de votos por candidato y por recinto o consolidado.
- R8: las reglas de acceso se aplicaron en el backend.
- R9: se mostraron estados explícitos de carga, éxito, error y validación.

## Contexto
El coordinador provincial necesitó conocer oportunamente el avance del escrutinio: cuántas actas se registraron frente al total de JRV, los votos por candidatura de alcaldía y de prefectura, y dónde se capturó cada acta. La consulta debió poder verse por recinto o de forma consolidada. El dashboard manejó datos electorales, por lo que solo el rol provincial debió acceder al consolidado. Los criterios fueron la correctitud de las sumas, el rendimiento en un teléfono con conexión limitada, la seguridad por rol, el costo de dependencias y la facilidad de explicar el código en la defensa.

## Alternativas consideradas
**Cálculo de los totales**

- **A. Agregación en el servidor con vistas SQL**
  - Ventajas: el teléfono recibió solo los totales (decenas de filas); las sumas se hicieron con `GROUP BY`; RLS se aplicó en el mismo lugar que el resto de las reglas; el resultado fue idéntico para cualquier cliente.
  - Desventajas: requirió escribir y mantener las vistas en las migraciones; un error en el SQL afectó a todos los consumidores.
- **B. Descargar todas las actas y sumar en la app**
  - Ventajas: no requirió vistas ni migraciones adicionales.
  - Desventajas: transfirió miles de filas y votos al teléfono, aumentó el consumo de datos, expuso detalle innecesario y duplicó la lógica de suma en el cliente.
- **C. Contadores mantenidos con triggers**
  - Ventajas: la lectura fue muy rápida.
  - Desventajas: aumentó la complejidad y el riesgo de que los contadores se desincronizaran al corregir un acta.

**Actualización de los datos**

- **D. Refresco manual y al abrir la pantalla**
  - Ventajas: fue simple, predecible y consumió pocos recursos.
  - Desventajas: los datos pudieron quedar desactualizados hasta el siguiente refresco.
- **E. Suscripción en tiempo real (Supabase Realtime)**
  - Ventajas: el avance se mostró sin intervención.
  - Desventajas: añadió complejidad, consumo de conexiones del plan gratuito y no fue exigido por R4.

**Presentación de los resultados**

- **F. Barras con HTML y CSS (anchos proporcionales) más tablas**
  - Ventajas: no añadió dependencias, no aumentó el tamaño del APK y el código fue explicable línea por línea.
  - Desventajas: ofreció menos tipos de gráfico y sin interacciones.
- **G. Librería de gráficos (Chart.js / ng2-charts)**
  - Ventajas: ofreció gráficos más completos y con interacciones.
  - Desventajas: añadió una dependencia que debió justificarse, aumentó el peso de la aplicación y exigió configuración adicional.

**Coordenadas GPS**

- **H. Lista de actas con enlace a un mapa externo**
  - Ventajas: no requirió librerías ni claves de mapas.
  - Desventajas: obligó a salir de la app para ver el mapa.
- **I. Mapa incrustado (Leaflet u otro)**
  - Ventajas: mostró todas las ubicaciones en una sola vista.
  - Desventajas: añadió una dependencia y dependió de proveedores de teselas externos.

## Decisión
Se eligió la combinación **A + D + F + H**.

- **Vistas SQL.** Se crearon en `supabase/migrations`, con `security_invoker = true`, de modo que las políticas RLS se aplicaron al usuario que consultó:
  - `resultados_por_candidato_recinto(recinto_id, dignidad, candidatura_id, organizacion, votos)`, que sumó `acta_votos`.
  - `resultados_blancos_nulos_recinto(recinto_id, dignidad, blancos, nulos, sufragantes)`.
  - `avance_actas_recinto(recinto_id, total_jrv, actas_alcalde, actas_prefecto)`, que comparó las actas registradas con `recintos.num_jrv`.
- **Consolidado.** Se calculó sumando las filas por recinto (`GROUP BY candidatura`) en una consulta del repositorio, sin una tabla aparte.
- **Acceso.** Las pantallas del dashboard residieron bajo `/provincial` con `rolGuard`, y además las políticas RLS impidieron que un coordinador de recinto o un veedor obtuvieran el consolidado desde la API (ADR-007 y ADR-008).
- **Capas.** `DashboardPage` consumió `DashboardService`, que usó `DashboardRepository`; solo el repositorio importó el cliente de Supabase (ADR-004).
- **Estado.** El servicio expuso `Estado<ResultadosDashboard>` con Signals; la pantalla mostró cargando, error con reintento y estado vacío cuando no hubo actas (ADR-005).
- **Actualización.** Se cargó al abrir la pantalla y con un botón y un gesto de arrastre para refrescar; se mostró la hora de la última actualización.
- **Gráficos.** Se dibujaron barras con elementos HTML cuyo ancho fue proporcional a los votos (`width: calc(votos / max * 100%)`), junto con una tabla con los valores exactos. Se aceptó que no se añadiera una librería de gráficos.
- **Filtros.** Se permitió elegir la dignidad (alcalde o prefecto) y el recinto, con la opción "Consolidado".
- **GPS.** Se mostró una lista de actas con recinto, mesa, fecha, coordenadas y precisión, con un enlace `https://www.google.com/maps?q=lat,lng` abierto en el navegador.
- **Actas observadas.** No se creó un estado "observada", porque R6 exigió bloquear el guardado de actas con totales inconsistentes. Solo las actas válidas y sus correcciones entraron en las sumas.

## Consecuencias
- Beneficios: el teléfono recibió solo los totales, las sumas fueron consistentes y se mantuvo una sola fuente de verdad con la seguridad aplicada en la base de datos.
- Obligaciones: se debieron versionar las vistas en las migraciones y mantener las pruebas de acceso por rol (ADR-010).
- Riesgos: (1) un error en las vistas pudo producir totales incorrectos; se mitigó con una prueba que comparó el resultado con la suma manual de las actas de prueba. (2) Los datos pudieron quedar desactualizados entre refrescos; se mitigó mostrando la hora de la última actualización y el botón de refresco. (3) Con muchos recintos, la lista de GPS pudo hacerse larga; se mitigó con filtro por recinto y paginación.

## Verificación
- Se estableció una prueba SQL: con un conjunto fijo de actas de prueba, `resultados_por_candidato_recinto` debió devolver exactamente la suma calculada a mano para cada candidatura.
- Se definió que, para cada recinto, la suma de votos de las cinco organizaciones más blancos y nulos debía coincidir con el total de sufragantes de sus actas.
- Se definió que una consulta a las vistas con la sesión de un veedor o de un coordinador de recinto no debía devolver datos de otros recintos, y que el consolidado debía ser exclusivo del provincial.
- Se definió que, al registrar una nueva acta y refrescar el dashboard, los totales debían cambiar de acuerdo con los votos ingresados.
- Se definió que, sin conexión, el dashboard debía mostrar un mensaje de error con reintento, y que sin actas debía mostrar el estado vacío.
- Se estableció una revisión visual en el APK: las barras debían ser proporcionales y la tabla debía coincidir con ellas.

## Uso de IA
- Herramienta: Gemini IA.
- Consulta realizada: comparación de estrategias para el dashboard provincial (agregación en servidor vs. cliente, refresco manual vs. tiempo real, gráficos con HTML/CSS vs. librerías externas y manejo de coordenadas GPS).
- Respuesta sugerida: la herramienta recomienda utilizar vistas SQL con `security_invoker = true` para calcular los totales en el servidor bajo RLS, actualización por refresco manual, barras proporcionales con HTML y CSS sin librerías externas, y una lista de actas con enlaces directos a Google Maps.
- Aceptación/Rechazo: Aceptado. El equipo adoptará la combinación de vistas SQL, refresco manual, gráficos nativos con HTML/CSS y enlaces externos para GPS, con el fin de reducir el consumo de datos, evitar dependencias innecesarias y mantener la seguridad en la base de datos.
- Verificación humana: el equipo ejecutará pruebas SQL para comprobar que `resultados_por_candidato_recinto` coincidirá con la suma manual de las actas de prueba, verificará que RLS restringirá el consolidado al rol provincial y realizará una revisión visual en el APK para validar las barras proporcionales, la tabla y los estados de error y vacío.
## Trazabilidad
- Commit del ADR:   git commit -m "docs(adr): propuestas ADR-001 a ADR-010"
- Commit de implementación: [enlace]

## Consenso del equipo
