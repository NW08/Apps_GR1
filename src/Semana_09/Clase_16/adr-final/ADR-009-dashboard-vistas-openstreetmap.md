# ADR-009: Construir el dashboard con agregación en el servidor (vistas SQL), refresco manual, barras sin librería externa y mapa de OpenStreetMap

| Campo | Valor |
|---|---|
| **Estado** | Aceptado |
| **Fecha** | 2026-11-24 |
| **Autor(es) y equipo** | Equipo 6: Eduardo Ganchala, Josué Ortiz |
| **Origen** | Propuesta de Eduardo Ganchala (su ADR-010), con dos cambios del debate: las actas observadas se cuentan marcadas y con filtro, y el mapa usa OpenStreetMap. Rechaza la propuesta de Josué Ortiz (su ADR-009, agregaciones de Firestore + Chart.js). |
| **Requisitos relacionados** | R4 (avance de actas, coordenadas GPS y votos por candidato por recinto o consolidado), R8 (acceso aplicado en el backend), R9 (estados explícitos). |

## Contexto

El coordinador provincial necesita conocer el avance (actas registradas frente al total de JRV), los votos por candidatura de alcaldía
y prefectura y dónde se capturó cada acta, por recinto o consolidado. Solo el provincial accede al consolidado. Criterios: sumas
correctas, rendimiento con conexión limitada, seguridad por rol, pocas dependencias y código explicable en la defensa.

## Alternativas consideradas

| Aspecto | **Elegida** | Alternativas descartadas |
|---|---|---|
| Cálculo de totales | **A. Vistas SQL en el servidor:** el teléfono recibe decenas de filas; RLS en el mismo lugar. | B. Descargar todas las actas y sumar en la app (miles de filas, lógica duplicada). C. Contadores con triggers (riesgo de desincronización al corregir). |
| Actualización | **D. Al abrir la pantalla y con refresco manual.** | E. Supabase Realtime (complejidad y conexiones del plan Free; R4 no lo exige). |
| Presentación | **F. Barras HTML/CSS proporcionales + tabla:** sin dependencias, explicable línea por línea. | G. Chart.js / ng2-charts (dependencia y peso extra). |
| Coordenadas GPS | **I. Mapa con teselas de OpenStreetMap + lista:** sin clave de API ni costo. | H-bis. Solo enlace a Google Maps (sale de la app y depende de un servicio comercial). |
| Actas observadas | **Contarlas marcadas, con filtro para excluirlas.** | No contarlas (oculta información al coordinador); contarlas sin marca (mezcla datos dudosos). |

## Decisión

- **Vistas SQL** con `security_invoker = true` (RLS se aplica a quien consulta), en `supabase/migrations`:
  - `resultados_por_candidato_recinto(recinto_id, dignidad, candidatura_id, organizacion, votos, observada)`;
  - `resultados_blancos_nulos_recinto(recinto_id, dignidad, blancos, nulos, sufragantes)`;
  - `avance_actas_recinto(recinto_id, total_jrv, actas_alcalde, actas_prefecto, observadas, sin_ubicacion)`.
- **Consolidado:** suma de las filas por recinto en una consulta del `DashboardRepository`.
- **Actas observadas:** se cuentan en los totales y se marcan con un distintivo («Incluye N actas observadas»); un interruptor
  **«Excluir actas observadas»** recalcula los totales sin ellas.
- **Gráficos:** barras HTML con ancho proporcional (`width: calc(votos / max * 100%)`) y tabla con valores exactos.
- **Filtros:** dignidad (alcalde o prefecto) y recinto, con opción «Consolidado».
- **GPS:** pestaña «Mapa GPS» con teselas de **OpenStreetMap** (atribución visible) y un pin por acta; lista con recinto, mesa,
  fecha, coordenadas y precisión, con enlace a `https://www.openstreetmap.org/?mlat={lat}&mlon={lng}`. Las actas sin GPS aparecen
  en la lista como «Ubicación no comprobable» (ADR-003).
- **Acceso:** rutas bajo `/provincial` con `rolGuard`; RLS impide que recinto o veedor obtengan el consolidado desde la API.
- **Capas y estado:** `DashboardPage` → `ProvincialDashboardStore` → `DashboardRepository`; `Estado<T>` con cargando, vacío, error con
  reintento y hora de la última actualización (ADR-004, ADR-005).

## Consecuencias

- **Beneficios:** pocos datos al teléfono; una sola fuente de verdad con seguridad en la base de datos; sin librería de gráficos.
- **Obligaciones:** versionar las vistas; mantener la prueba de acceso por rol (ADR-010); respetar la política de uso de teselas de
  OpenStreetMap (atribución y uso moderado).
- **Riesgos:** un error en las vistas produce totales incorrectos (mitigación: comparar con la suma manual de las actas de prueba);
  datos desactualizados entre refrescos (mitigación: hora de la última actualización y botón de refresco); contar las observadas
  aumenta lecturas, objeción de Josué Ortiz (mitigación: el filtro se resuelve en la misma consulta, sin peticiones extra).

## Verificación

- Con actas de prueba fijas, `resultados_por_candidato_recinto` devuelve la suma calculada a mano.
- Activar «Excluir actas observadas» cambia los totales en exactamente los votos de las actas observadas.
- Con la sesión de un veedor o de un coordinador de recinto, las vistas no devuelven datos de otros recintos.
- Revisión en el APK: barras proporcionales y coincidentes con la tabla; el mapa muestra los pines de las actas con GPS.

## Uso de IA

- **Eduardo Ganchala · Gemini:** vistas con `security_invoker`, refresco manual, barras HTML/CSS y enlaces a Google Maps. Se aceptó;
  el mapa cambió a OpenStreetMap en el debate.
- **Josué Ortiz · Claude (Anthropic):** agregaciones `sum`/`count` de Firestore + Chart.js. Se rechazó por no usar Firebase y para
  evitar la dependencia de gráficos.
- **Verificación humana:** comparación de los totales del dashboard con la suma manual de las actas sembradas.

## Trazabilidad

- Propuestas: `adr-edu/ADR-010-dashboard.md` (aceptada con modificaciones) · `adr-mio/ADR-009-dashboard-consolidacion.md` (rechazada).
- Commit del ADR: [enlace]
- Commit de implementación: [enlace: vistas, `DashboardRepository`, `dashboard.page.ts`, mapa GPS]

## Consenso del equipo

| Integrante | Postura y argumentos | Objeciones |
|---|---|---|
| Eduardo Ganchala | Agregación en el servidor, refresco y barras sin librería. Propuso OpenStreetMap para el mapa. | — |
| Josué Ortiz | Agregaciones en el servidor con Chart.js. No quería contar las actas observadas. | Contarlas implica más costos de lectura y escritura en la base de datos. |

**Desacuerdo relevante:** cómo mostrar las actas observadas.

**Acuerdo final:** se cuentan las actas observadas pero se marcan, con un filtro para excluirlas; el mapa usa la API pública de
OpenStreetMap. · **Minuto del video:** [mm:ss–mm:ss]
