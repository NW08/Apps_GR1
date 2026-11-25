# ADR-009: Calcular el dashboard con consultas de agregación de Firestore (sum/count) y gráficos con Chart.js

| Campo | Valor |
|---|---|
| **Estado** | Rechazado: las agregaciones de Firestore y Chart.js se sustituyen por la propuesta de Eduardo Ganchala (agregación en el servidor con vistas SQL, refresco y gráficos sin librería externa) más un mapa con OpenStreetMap (decisión final ADR-009) |
| **Fecha** | 2026-11-23 |
| **Autor(es) y equipo** | Josué Ortiz · Equipo 6: Eduardo Ganchala, Josué Ortiz |
| **Requisitos relacionados** | R4 (avance de actas, coordenadas GPS, dashboard de votos por candidato, por recinto y consolidado), R5 (estados de las mesas del recinto), R9 (estados de carga y error). |

## Contexto

El coordinador provincial necesita ver:

- **el avance:** actas registradas frente al total esperado, que es Σ JRV × 2 dignidades;
- **los votos por candidato:** por recinto y consolidados del cantón, para alcaldía y prefectura;
- **las coordenadas GPS** de cada acta.

El volumen es pequeño (un cantón: decenas de recintos y cientos de actas), pero leer todas las actas en el dispositivo en cada
apertura consume lecturas y datos móviles. Firestore no tiene `GROUP BY`.

## Alternativas consideradas

| Criterio | **A. Agregaciones en el servidor (`getAggregateFromServer` con `sum`/`count`)** | B. Contadores mantenidos por una Cloud Function (trigger `onWrite` de actas) | C. Leer todas las actas y sumarlas en el cliente |
|---|---|---|---|
| Precisión | Exacta en cada consulta. | Exacta si el trigger es idempotente; hay riesgo de doble conteo en los reintentos. | Exacta. |
| Coste | 1 lectura por cada 1000 documentos agregados. | 1 lectura por panel + escrituras del trigger. | 1 lectura por acta. |
| Tiempo real | No (se refresca a demanda o cada N s). | Sí (se escucha el documento de contadores). | Sí (con un listener). |
| Complejidad | Baja. | Media/alta (transacciones e idempotencia). | Baja. |
| Sin conexión | No funciona. | El último valor queda en la caché. | Funciona con la caché. |

**Gráficos:** Chart.js (**elegido**: una dependencia madura y liviana; se integra directamente en un componente standalone con
`<canvas>`) frente a barras hechas con CSS (sin dependencias, pero sin leyendas ni accesibilidad), o ngx-charts/ECharts (más pesados).

## Decisión

- **Avance:** `count()` de `actas` (total y por `recintoId`) frente a `Σ numJrv × 2` de los recintos. Se muestra con una barra de
  progreso global y una lista por recinto con el porcentaje y el semáforo de colores.
- **Votos:** para cada dignidad, una agregación con `{ o1: sum('votos.o1'), …, o5: sum('votos.o5'), nulos: sum('nulos'),
  blancos: sum('blancos'), total: sum('totalSufragantes') }`:
  - **consolidado**, con el filtro `dignidad == X`;
  - **por recinto**, añadiendo `recintoId == R` (una consulta por recinto, solo al abrir su detalle).
- **Vista:** un selector `ion-segment` (Alcaldía / Prefectura) y otro de ámbito (Consolidado / Recinto). Barras horizontales con el
  nombre del candidato, la organización, los votos y el porcentaje sobre los votos válidos; los nulos y blancos aparte.
- **Actas `OBSERVADA`:** se incluyen por defecto; el panel muestra cuántas hay y un interruptor «Excluir observadas», que añade el filtro
  `estado != OBSERVADA` (requiere un índice).
- **GPS:** lista de actas con recinto, mesa, dignidad, coordenadas y precisión; al tocar una, se abre el mapa del sistema con
  `https://www.google.com/maps/search/?api=1&query=lat,lng`. Si la precisión supera 100 m, se marca con un aviso. Un mapa incrustado
  (Leaflet) queda como mejora opcional.
- **Refresco:** al entrar, con *pull-to-refresh* y automáticamente cada 60 s mientras la pantalla está visible. Se muestra «Actualizado
  hace N s».
- **Coordinador de recinto:** las mesas y sus estados se calculan con un listener sobre `actas where recintoId == R` (pocas actas, en
  tiempo real) más las `mesas` del recinto.

## Consecuencias

- **Beneficios:** sin lógica de servidor adicional ni riesgo de doble conteo; lecturas mínimas; el código del cálculo es corto y fácil de
  explicar.
- **Obligaciones:** índices compuestos para `actas(dignidad, recintoId)` y `actas(dignidad, estado)`; los nombres de los campos
  `votos.oN` coinciden con los ids de `organizaciones`.
- **Limitaciones:** el dashboard **requiere conexión** («Requiere conexión para consultar resultados») y no es en tiempo real
  (refresco cada 60 s).
- **Riesgo:** si un acta se guarda con un campo no numérico, `sum` lo ignora en silencio y el total sale mal. **Mitigación:** las reglas
  exigen `int` en todos los campos de votos (ADR-008).

## Verificación

- **Prueba de integración con el emulador:** se siembran 3 actas con votos conocidos y `dashboard.repository.spec.ts` comprueba que el
  consolidado y el valor por recinto coinciden con la suma esperada.
- **Manual:** registrar un acta nueva como veedor → tras refrescar, el avance sube 1 y los votos del candidato aumentan en lo registrado.
- **Captura** del dashboard (consolidado y por recinto) en `docs/evidencias/`.

## Uso de IA

- **Herramienta:** Claude (Anthropic).
- **Consulta:** cómo consolidar votos en Firestore sin `GROUP BY`.
- **Respuesta sugerida:** agregaciones `sum`/`count` + Chart.js.
- **Aceptación / rechazo:** se rechazó. Las agregaciones `sum`/`count` de Firestore no aplican al no
  usar Firebase (ADR-002) y el equipo prefirió gráficos sin librería externa.
- **Verificación humana:** no aplica a esta propuesta; los totales del dashboard se contrastarán con una
  suma manual de las actas sembradas en la decisión final.

## Trazabilidad

- Commit del ADR: [7bcce3d](https://github.com/NW08/Apps_GR1/commit/7bcce3d)
- Commit de implementación: no aplica (propuesta rechazada); la implementación sigue la decisión final ADR-009.

## Consenso del equipo

| Integrante | Postura y argumentos | Objeciones |
|---|---|---|
| Josué Ortiz | Consolidación con agregaciones en el servidor y gráficos con Chart.js. No quería contar las actas observadas, porque implican más costos de lectura y escritura en la base de datos. | Contar las observadas aumenta las lecturas y escrituras. |
| Eduardo Ganchala | Agregación en el servidor, actualización por refresco y gráficos sin librería externa. Propuso OpenStreetMap para mostrar las coordenadas GPS. | — |

**Desacuerdo relevante:** cómo mostrar las actas observadas en el dashboard.

**Acuerdo final:** las actas observadas se cuentan pero se marcan, con un filtro para excluirlas. El mapa de coordenadas usa la
API pública de OpenStreetMap. ·
**Minuto del video:** 00:58:02–01:09:51 (consenso 01:08:34–01:09:40)
