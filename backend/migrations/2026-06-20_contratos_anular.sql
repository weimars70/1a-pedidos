-- ============================================================================
-- Migración: Anulación (soft-delete) y auditoría de usuarios en contratos
-- Fecha: 2026-06-20
-- Aplica a: tabla terminacion_contrato  +  vista terminacion_contrato_view
-- IMPORTANTE: estos cambios se aplicaron en la BD de DESARROLLO (unoa @ 2.58.80.90:55433).
--             Ejecutar este script en PRODUCCIÓN antes de desplegar el backend nuevo.
-- Idempotente: se puede ejecutar varias veces sin error.
-- ============================================================================

-- 1) Nuevas columnas en terminacion_contrato ---------------------------------
--    anulado        -> bandera de soft-delete (true = inactivo, no se borra)
--    usuario_anula  -> id (usuarios.id) de quien anuló
--    fecha_anula    -> momento de la anulación
ALTER TABLE terminacion_contrato
  ADD COLUMN IF NOT EXISTS anulado       boolean   NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS usuario_anula integer   NULL,
  ADD COLUMN IF NOT EXISTS fecha_anula   timestamp NULL;

-- 2) Recrear la vista exponiendo usuario_crea / usuario_anula / anulado -------
--    usuario_crea  = nombre resuelto desde usuarios (fallback: id como texto)
--    usuario_anula = nombre resuelto desde usuarios (null si no anulado)
CREATE OR REPLACE VIEW terminacion_contrato_view AS
 SELECT a.id,
    a.fecha,
    a.fecha_terminacion,
    a.id_cliente,
    c.nombre AS nombre_cliente,
    a.personas,
    a.fecha_inicio,
    a.id_supervisor,
    e.nombre AS nombre_supervisor,
    a.id_causa,
    b.nombre AS causal,
    a.observacion,
    a.gestion_humana,
    a.facturacion,
    a.id_pedido,
    a.prestacion_servicio,
    a.usuario_factura AS usuario_facturacion,
    a.usuario_gestion_humana,
    a.usuario_prestacion_servicio,
    a.fecha_facturacion,
    a.fecha_gestion_humana,
    a.fecha_prestacion_servicio,
    c.ident AS nit,
        CASE
            WHEN a.tipo = 1 THEN 'Terminacion'::text
            ELSE 'Disminución'::text
        END AS tipo,
    a.perfil,
    p.nombre AS n_perfil,
    a.usuario AS usuario_crea_id,
    COALESCE(NULLIF(TRIM(CONCAT(uc.first_name, ' ', uc.last_name)), ''), a.usuario::text) AS usuario_crea,
    a.usuario_anula AS usuario_anula_id,
    NULLIF(TRIM(CONCAT(ua.first_name, ' ', ua.last_name)), '') AS usuario_anula,
    a.anulado,
    a.fecha_anula
   FROM terminacion_contrato a
     JOIN causal_terminacion_contrato b ON a.id_causa = b.id
     JOIN clientes c ON c.codigo = a.id_cliente
     JOIN empleados e ON e.codigo = a.id_supervisor
     LEFT JOIN perfiles p ON a.perfil = p.id
     LEFT JOIN usuarios uc ON uc.id = a.usuario
     LEFT JOIN usuarios ua ON ua.id = a.usuario_anula;

-- ============================================================================
-- ROLLBACK (si fuera necesario revertir):
--   DROP VIEW terminacion_contrato_view;  -- y recrear la versión anterior
--   ALTER TABLE terminacion_contrato
--     DROP COLUMN IF EXISTS anulado,
--     DROP COLUMN IF EXISTS usuario_anula,
--     DROP COLUMN IF EXISTS fecha_anula;
-- ============================================================================
