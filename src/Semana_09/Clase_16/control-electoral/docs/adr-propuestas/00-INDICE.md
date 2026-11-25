# Prueba 2 · Control electoral — Índice de ADR (propuestas individuales)

> **Estado:** propuestas individuales de Josué Ortiz (Equipo 6), presentadas en la deliberación del 2026-11-24. Cada archivo conserva
> la propuesta original y registra su resultado en «Estado» y «Consenso del equipo». Las decisiones definitivas del equipo están en
> `../adr-final/` y en `../ADR-CONSOLIDADO.md`.

## Lista de decisiones

| ADR | Decisión propuesta | Anexo A.7 / A.3 | Requisitos | Resultado |
|---|---|---|---|---|
| [ADR-001](ADR-001-ionic-angular-standalone.md) | Ionic Angular standalone + Capacitor | A.7 · framework | R1–R9 | Aceptado → ADR-001 final |
| [ADR-002](ADR-002-firebase-backend.md) | Firebase (Auth, Firestore, Storage, Functions) | A.7 · backend | R2, R3, R4, R8, R10 | Rechazado → ADR-002 final (Supabase) |
| [ADR-003](ADR-003-capacitor-camara-gps-nitidez.md) | Cámara, GPS, permisos y nitidez | A.7 · plugins | R5, R6, R7, R10 | Aceptado con modificaciones → ADR-003 final |
| [ADR-004](ADR-004-arquitectura-capas.md) | Capas + carpetas por funcionalidad + repositorios | A.7 · arquitectura | R4–R6, R8, R9, R10 | Aceptado → ADR-004 final |
| [ADR-005](ADR-005-estado-formularios-navegacion-errores.md) | Signals, Reactive Forms, guardas, estados explícitos | A.7 · estado/formularios | R2, R3, R4–R6, R9 | Aceptado → ADR-005 final |
| [ADR-006](ADR-006-offline-sincronizacion.md) | Offline: caché de Firestore + cola de fotos + conflictos por versión | A.7 · opcional | R6, R7, R8, R10 | Rechazado → ADR-006 final (Dexie) |
| [ADR-007](ADR-007-identidad-cuentas-roles.md) | Cuentas con Functions + claims; login por cédula | A.3 · autenticación y roles | R2, R3, R8 | Rechazado → ADR-007 final (Supabase Auth) |
| [ADR-008](ADR-008-modelo-datos-reglas-acceso.md) | Modelo de Firestore, reglas, Storage y siembra | A.3 · datos y políticas | R1, R4–R8 | Rechazado → ADR-008 final (relacional + RLS) |
| [ADR-009](ADR-009-dashboard-consolidacion.md) | Dashboard con agregaciones + Chart.js | A.3 (complementario) | R4, R5, R9 | Rechazado → ADR-009 final (vistas + OpenStreetMap) |
| [ADR-010](ADR-010-pruebas-errores-monitoreo.md) | Pruebas en 3 niveles, errores y monitoreo | A.3 · pruebas y errores | R2, R3, R6–R9 | Aceptado → ADR-010 final |

## Trazabilidad requisito → ADR

| Requisito | ADR que lo resuelven |
|---|---|
| R1 · Datos iniciales | 008 |
| R2 · Jerarquía y cuentas | 007, 005, 002 |
| R3 · Acceso | 007, 005, 002 |
| R4 · Coordinador provincial | 009, 008, 007 |
| R5 · Coordinador de recinto | 008, 009, 005 |
| R6 · Veedor | 005, 008, 003 |
| R7 · Cámara y ubicación | 003, 008 |
| R8 · Backend y seguridad | 002, 007, 008, 010 |
| R9 · Arquitectura y UX | 004, 005, 001 |
| R10 · Conectividad (extra) | 006, 002 |

## Orden sugerido para el debate (con minutos para el índice del video)

1. **ADR-001 framework:** decisión única obligatoria para el equipo. ~5 min.
2. **ADR-002 backend + ADR-007 cuentas:** juntos, porque Functions y el plan Blaze condicionan ambos. ~10 min.
3. **ADR-008 modelo y reglas:** el más importante para R8. ~10 min.
4. **ADR-004 arquitectura + ADR-005 estado y formularios.** ~8 min.
5. **ADR-003 cámara, GPS y nitidez.** ~5 min.
6. **ADR-009 dashboard + ADR-010 pruebas.** ~5 min.
7. **ADR-006 offline:** ¿se implementa? ¿quién? ~5 min.
8. Cierre: resumen de acuerdos y desacuerdos registrados. ~2 min.

## Puntos que conviene llevar decididos o preguntados al debate

- **Plan Blaze (ADR-002/007):** ¿todos pueden registrar una tarjeta? Si no, se acuerda la alternativa B de ADR-007 como línea base,
  o como ADR de reemplazo individual.
- **Provincia y cantón** de los datos iniciales (R1) y si los recintos son reales o ficticios.
- **Organizaciones:** se proponen ficticias, para evitar contenido político real.
- **Acta físicamente inconsistente:** ¿se acepta el estado `OBSERVADA` (ADR-005)? Es la decisión de negocio más discutible.
- **R10:** ¿lo implementan todos o es individual? (bonificación de hasta 2,1 puntos).
- **Versiones exactas** de Angular, Ionic, Capacitor y Node: se fijan para todos (`ionic info`).
