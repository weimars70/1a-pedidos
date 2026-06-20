-- =============================================================================
-- VISTAS POSTGRESQL CON SUFIJO _camilo
-- Generadas desde pedidos.service.ts — sin filtros dinámicos ni LIMIT
-- Ejecutar directamente en psql: \i views_camilo.sql
-- =============================================================================


-- ---------------------------------------------------------------------------
-- 1. view_pedidos_all_camilo
--    Fuente: PedidosService.findAll()
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW view_pedidos_all_camilo AS
SELECT DISTINCT ON (p.id)
  p.id,
  p.nit,
  p.nombre,
  p.fecha_pedido,
  p.usuario,
  p.facturado,
  p.direccion,
  p.telefono,
  pp.fecha_inicio,
  pp.fecha_final,
  pp.estado,
  pp.valor_servicio,
  pp.nro_personas
FROM pedidos p
LEFT JOIN pedidos_personal pp ON pp.id_pedido = p.id
ORDER BY p.id DESC, pp.id DESC;


-- ---------------------------------------------------------------------------
-- 2. view_pedidos_personal_camilo
--    Fuente: PedidosService.findPersonal()
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW view_pedidos_personal_camilo AS
SELECT
  pp.id,
  pp.id_pedido,
  pp.tipo_perfil,
  pp.sexo,
  pp.estado,
  pp.tipo_servicio,
  pp.fecha_inicio,
  pp.fecha_final,
  pp.hora_inicio,
  pp.hora_final,
  pp.nro_personas,
  pp.valor_servicio,
  pp.bonificacion,
  pp.riesgo_arl,
  pp.per_recomendacion,
  pp.observaciones,
  pp.enviado_coordinador,
  pp.facturado,
  pp.causal,
  NULL::text   AS faltante,
  p.nit,
  p.nombre,
  p.fecha_pedido,
  p.nombre_asesor AS asesor,
  p.usuario,
  p.direccion,
  p.telefono,
  b.nombre     AS perfil,
  s.nombre     AS sexo_nombre,
  e.nombre     AS estado_nombre,
  x.nombre     AS tipo_servicio_nombre
FROM pedidos_personal pp
JOIN pedidos          p  ON p.id          = pp.id_pedido
JOIN clientes         c  ON c.ident        = p.nit
JOIN perfiles         b  ON b.id           = pp.tipo_perfil
JOIN sexo             s  ON s.id           = pp.sexo
JOIN estados_pedidos  e  ON e.id           = pp.estado
JOIN tipo_servicio    x  ON x.id           = pp.tipo_servicio
ORDER BY pp.id_pedido DESC;


-- ---------------------------------------------------------------------------
-- 3. view_pedidos_personal_programados_camilo
--    Fuente: PedidosService.findPersonalProgramados()  (estado = 2)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW view_pedidos_personal_programados_camilo AS
SELECT
  pp.id,
  pp.id_pedido,
  pp.tipo_perfil,
  pp.sexo,
  pp.estado,
  pp.tipo_servicio,
  pp.fecha_inicio,
  pp.fecha_final,
  pp.hora_inicio,
  pp.hora_final,
  pp.nro_personas,
  pp.valor_servicio,
  pp.bonificacion,
  pp.riesgo_arl,
  pp.per_recomendacion,
  pp.observaciones,
  pp.enviado_coordinador,
  pp.facturado,
  pp.causal,
  NULL::text   AS faltante,
  p.nit,
  p.nombre,
  p.fecha_pedido,
  p.nombre_asesor AS asesor,
  p.usuario    AS usuario_pedido,
  p.direccion,
  p.telefono,
  b.nombre     AS perfil,
  s.nombre     AS sexo_nombre,
  e.nombre     AS estado_nombre,
  x.nombre     AS tipo_servicio_nombre
FROM pedidos_personal pp
JOIN pedidos          p  ON p.id          = pp.id_pedido
JOIN clientes         c  ON c.ident        = p.nit
JOIN perfiles         b  ON b.id           = pp.tipo_perfil
JOIN sexo             s  ON s.id           = pp.sexo
JOIN estados_pedidos  e  ON e.id           = pp.estado
JOIN tipo_servicio    x  ON x.id           = pp.tipo_servicio
WHERE pp.estado = 2
ORDER BY pp.id_pedido DESC;


-- ---------------------------------------------------------------------------
-- 4. view_pedidos_especiales_camilo
--    Fuente: PedidosService.findEspeciales()
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW view_pedidos_especiales_camilo AS
SELECT DISTINCT ON (p.id)
  p.id,
  p.nit,
  p.nombre,
  p.fecha_pedido,
  p.personas_esp,
  p.dias_esp,
  p.usuario,
  p.direccion,
  p.telefono,
  pe.id            AS id_equipo,
  pe.valor_servicio,
  pe.mano_obra,
  pe.insumos,
  pe.transporte,
  pe.depreciacion,
  pe.imprevistos,
  pe.observacion,
  pe.genero        AS n_genero,
  te.nombre        AS tipo_equipo,
  ts.nombre        AS n_tipo_servicio
FROM pedidos p
JOIN pedidos_equipos pe ON pe.id_pedido = p.id
LEFT JOIN tipo_equipo   te ON te.id = pe.tipo_equipo
LEFT JOIN tipo_servicio ts ON ts.id = pe.tipo_servicio
ORDER BY p.id DESC, pe.id ASC;


-- ---------------------------------------------------------------------------
-- 5. view_pedidos_especiales_programados_camilo
--    Fuente: PedidosService.findEspecialesProgramados()  (pe.estado = 1)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW view_pedidos_especiales_programados_camilo AS
SELECT DISTINCT ON (p.id)
  p.id                       AS pedido,
  p.nit,
  p.nombre,
  p.fecha_pedido,
  pe.fecha_inicio,
  pe.fecha_final,
  p.dias_esp                 AS dias,
  p.personas_esp             AS personas,
  pe.valor_servicio,
  te.nombre                  AS tipo_equipo,
  NULL::text                 AS coordinador_operativo,
  p.usuario,
  pe.observacion             AS observacion,
  NULL::text                 AS nro_pedido_fisico,
  pe.id                      AS id
FROM pedidos p
JOIN pedidos_equipos pe  ON pe.id_pedido  = p.id
LEFT JOIN tipo_equipo te ON te.id          = pe.tipo_equipo
WHERE pe.estado = 1
ORDER BY p.id DESC, pe.id ASC;


-- ---------------------------------------------------------------------------
-- 6. view_pedidos_areas_camilo
--    Fuente: PedidosService.findAreas()
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW view_pedidos_areas_camilo AS
SELECT DISTINCT ON (p.id)
  p.id              AS id_pedido,
  p.nit,
  p.nombre,
  p.fecha_pedido,
  pp.fecha_inicio,
  pp.fecha_final,
  pp.nro_personas,
  pp.valor_servicio,
  (SELECT STRING_AGG(func_nombre_empleado(pa.empleado), ', ')
   FROM pedidos_asignados pa
   WHERE pa.id_pedido_personal = pp.id) AS auxiliares,
  p.usuario,
  ep.nombre         AS estado,
  ep.area           AS area_responsable
FROM pedidos p
JOIN pedidos_personal pp ON pp.id_pedido = p.id
JOIN estados_pedidos  ep ON ep.id = pp.estado
ORDER BY p.id DESC, pp.id DESC;


-- ---------------------------------------------------------------------------
-- 7. view_pedidos_especiales_areas_camilo
--    Fuente: PedidosService.findEspecialesAreas()
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW view_pedidos_especiales_areas_camilo AS
SELECT
  v.id_pedido,
  v.nit,
  v.nombre,
  v.ciudad,
  v.fecha_pedido,
  v.fecha_asignacion,
  v.fecha_inicio,
  v.fecha_final,
  v.personas,
  v.dias,
  v.n_tipo_servicio,
  v.valor_servicio,
  v.factura,
  NULL::text                 AS auxiliares,
  v.tipo_equipo,
  NULL::text                 AS coordinador_operativo,
  v.observacion
FROM view_pedidos_equipos v
ORDER BY v.id_pedido DESC;


-- ---------------------------------------------------------------------------
-- 8. view_pedidos_anulados_camilo
--    Fuente: PedidosService.findAnulados()  (estado = 3 = CANCELADO)
--    Diferenciador confirmado: 292 registros al 2026-05-23
--    Campos NULL: faltante (no existe en pedidos_personal)
--    riesgo_arl: código entero (tabla riesgo_arl sin nombre descriptivo)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW view_pedidos_anulados_camilo AS
SELECT
  pp.id_pedido                                   AS pedido,
  b.nombre                                       AS perfil,
  p.nit,
  p.nombre,
  p.fecha_pedido,
  pp.fecha_inicio,
  pp.fecha_final,
  pp.hora_inicio,
  pp.hora_final,
  pp.nro_personas,
  NULL::text                                     AS faltante,
  s.nombre                                       AS sexo,
  x.nombre                                       AS tipo_servicio,
  pp.valor_servicio,
  pp.riesgo_arl,
  pp.per_recomendacion,
  pp.bonificacion,
  pp.observaciones,
  (u.first_name || ' ' || u.last_name)             AS usuario,
  ep.nombre                                      AS estado,
  pp.usuario_anula,
  cn.nombre                                      AS causal
FROM pedidos_personal pp
JOIN      pedidos              p  ON p.id   = pp.id_pedido
LEFT JOIN perfiles             b  ON b.id   = pp.tipo_perfil
LEFT JOIN sexo                 s  ON s.id   = pp.sexo
LEFT JOIN tipo_servicio        x  ON x.id   = pp.tipo_servicio
LEFT JOIN estados_pedidos      ep ON ep.id  = pp.estado
LEFT JOIN causale_no_pedidos   cn ON cn.id  = pp.causal
LEFT JOIN usuarios             u  ON u.id   = pp.usuario
WHERE pp.estado = 3
ORDER BY pp.id_pedido DESC;


-- ---------------------------------------------------------------------------
-- 9. view_pedidos_facturados_camilo
--    Fuente: PedidosService.findFacturados()
--    Diferenciador: ep.area = 'TERMINO CICLO EN FACTURACIÓN'
--      estados_pedidos confirmados en BD:
--        id=5  FACTURADO  area='TERMINO CICLO EN FACTURACIÓN'  ← incluir (2618 registros al 2026-05-23)
--        id=6  ENVIADO COORDINADOR  area='FACTURACIÓN'          ← "A Facturar", excluir
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW view_pedidos_facturados_camilo AS
SELECT
  pp.id_pedido                                            AS pedido,
  b.nombre                                               AS perfil,
  p.nit,
  p.nombre,
  x.nombre                                               AS tipo_servicio,
  p.fecha_pedido,
  pp.fecha_inicio,
  pp.fecha_final,
  pp.nro_personas,
  pp.valor_servicio,
  (COALESCE(pp.valor_servicio, 0) + COALESCE(pp.bonificacion, 0))
                                                         AS total_servicio,
  pp.observaciones,
  pp.facturado
FROM pedidos_personal pp
JOIN      pedidos         p  ON p.id  = pp.id_pedido
LEFT JOIN perfiles        b  ON b.id  = pp.tipo_perfil
LEFT JOIN tipo_servicio   x  ON x.id  = pp.tipo_servicio
JOIN      estados_pedidos ep ON ep.id = pp.estado
WHERE ep.area = 'TERMINO CICLO EN FACTURACIÓN'
ORDER BY pp.id_pedido DESC;


-- ---------------------------------------------------------------------------
-- 10. view_pedidos_a_facturar_camilo
--     Fuente: PedidosService.findAFacturar()
--     Filtra por ep.area = 'FACTURACIÓN' (JOIN a estados_pedidos).
--     Estado que califica actualmente:
--       id=6  ENVIADO COORDINADOR  area='FACTURACIÓN'
--     Estado EXCLUIDO (ya pasó por facturación):
--       id=5  FACTURADO            area='TERMINO CICLO EN FACTURACIÓN'
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW view_pedidos_a_facturar_camilo AS
SELECT
  pp.id,
  pp.id_pedido,
  b.nombre                                   AS perfil,
  p.nit,
  p.nombre,
  x.nombre                                   AS tipo_servicio,
  p.fecha_pedido,
  pp.fecha_liberacion,
  pp.fecha_inicio,
  pp.fecha_final,
  pp.nro_personas,
  pp.valor_servicio,
  pp.bonificacion,
  (COALESCE(pp.valor_servicio, 0) + COALESCE(pp.bonificacion, 0))
                                             AS total_servicio,
  pp.usuario                                 AS registrado,
  pp.observaciones,
  pp.usuario_anula,
  p.hora_pedido,
  p.nombre_asesor                            AS asesor,
  p.id_cliente,
  ep.area,
  pp.pedido_anterior
FROM pedidos_personal pp
JOIN      pedidos         p  ON p.id   = pp.id_pedido
LEFT JOIN perfiles        b  ON b.id   = pp.tipo_perfil
LEFT JOIN tipo_servicio   x  ON x.id   = pp.tipo_servicio
JOIN      estados_pedidos ep ON ep.id  = pp.estado
WHERE ep.area = 'FACTURACIÓN'
ORDER BY pp.id_pedido DESC;


-- ---------------------------------------------------------------------------
-- 11. view_pedidos_empleados_camilo
--     Fuente: PedidosService.findEmpleados()
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW view_pedidos_empleados_camilo AS
SELECT DISTINCT ON (a.id)
  a.id,
  a.id_pedido,
  a.tipo_perfil,
  a.sexo,
  a.estado,
  a.tipo_servicio,
  a.fecha_inicio,
  a.fecha_final,
  a.nro_personas,
  a.valor_servicio,
  a.causal,
  p.nit,
  p.nombre,
  p.fecha_pedido,
  p.nombre_asesor     AS asesor,
  p.usuario,
  p.direccion,
  p.telefono,
  c.nombre            AS razon_social,
  b.nombre            AS perfil,
  s.nombre            AS genero,
  e.nombre            AS estado_nombre,
  x.nombre            AS tipo_servicio_nombre,
  pp.ident            AS empleado_ident,
  pp.nombre           AS empleado_nombre,
  y.nombre            AS causal_nombre,
  pa.id               AS asignacion_id
FROM pedidos_personal a
JOIN pedidos          p  ON a.id_pedido   = p.id
JOIN clientes         c  ON c.ident        = p.nit
JOIN pedidos_asignados pa ON pa.id_pedido  = a.id_pedido
                         AND a.tipo_perfil = pa.perfil
JOIN perfiles         b  ON a.tipo_perfil  = b.id
JOIN sexo             s  ON s.id           = a.sexo
JOIN estados_pedidos  e  ON a.estado       = e.id
JOIN tipo_servicio    x  ON x.id           = a.tipo_servicio
JOIN empleados        pp ON pp.ident       = pa.empleado
LEFT JOIN causale_no_pedidos y ON y.id     = a.causal
ORDER BY a.id DESC, pa.id DESC;


-- ---------------------------------------------------------------------------
-- 12. view_pedidos_enviados_coordinador_camilo
--     Fuente: PedidosService.findEnviadosCoordinador()
--     Diferenciador real: enviado_coordinador = 'Si' (cualquier estado) — 2430 registros confirmados.
--     Estado=6 solo tenía 13 registros; la flag enviado_coordinador cruza estados 3, 5 y 6.
--     faltante: existe en pedidos_personal como integer, retornado directamente
--     sexo: FK pp.sexo → sexo.id → s.nombre
--     contacto/telefono: desde clientes via p.id_cliente = c.id
--     total_servicio: COALESCE(valor_servicio,0) + COALESCE(bonificacion,0)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW view_pedidos_enviados_coordinador_camilo AS
SELECT
  pp.id,
  pp.id_pedido                                                    AS pedido,
  b.nombre                                                        AS perfil,
  p.nit,
  p.nombre,
  p.nombre_asesor                                                 AS asesor,
  p.fecha_pedido,
  pp.fecha_inicio,
  pp.fecha_final,
  pp.nro_personas                                                 AS no_personas,
  s.nombre                                                        AS sexo,
  ep.nombre                                                       AS estado,
  pp.usuario,
  pp.observaciones,
  pp.riesgo_arl,
  pp.per_recomendacion,
  pp.valor_servicio,
  pp.bonificacion,
  (COALESCE(pp.valor_servicio, 0) + COALESCE(pp.bonificacion, 0)) AS total_servicio,
  pp.faltante,
  x.nombre                                                        AS tipo_servicio,
  c.contacto,
  c.telefono
FROM pedidos_personal pp
JOIN      pedidos          p  ON p.id          = pp.id_pedido
LEFT JOIN clientes         c  ON c.id          = p.id_cliente
LEFT JOIN perfiles         b  ON b.id          = pp.tipo_perfil
LEFT JOIN sexo             s  ON s.id          = pp.sexo
LEFT JOIN estados_pedidos  ep ON ep.id         = pp.estado
LEFT JOIN tipo_servicio    x  ON x.id          = pp.tipo_servicio
WHERE pp.enviado_coordinador = 'Si'
ORDER BY pp.id_pedido DESC;


-- ---------------------------------------------------------------------------
-- 13. view_pedidos_supervision_camilo
--     Fuente: PedidosService.findSupervision()
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW view_pedidos_supervision_camilo AS
SELECT DISTINCT ON (a.id)
  a.id,
  a.id_pedido,
  a.tipo_perfil,
  a.sexo,
  a.estado,
  a.tipo_servicio,
  a.fecha_inicio,
  a.fecha_final,
  a.nro_personas,
  a.valor_servicio,
  a.causal,
  p.nit,
  p.nombre,
  p.fecha_pedido,
  p.nombre_asesor     AS asesor,
  p.usuario,
  p.direccion,
  p.telefono,
  c.nombre            AS razon_social,
  b.nombre            AS perfil,
  s.nombre            AS genero,
  e.nombre            AS estado_nombre,
  x.nombre            AS tipo_servicio_nombre,
  pp.ident            AS empleado_ident,
  pp.nombre           AS empleado_nombre,
  y.nombre            AS causal_nombre,
  pa.id               AS asignacion_id
FROM pedidos_personal a
JOIN pedidos          p  ON a.id_pedido   = p.id
JOIN clientes         c  ON c.ident        = p.nit
JOIN pedidos_asignados pa ON pa.id_pedido  = a.id_pedido
                         AND a.tipo_perfil = pa.perfil
JOIN perfiles         b  ON a.tipo_perfil  = b.id
JOIN sexo             s  ON s.id           = a.sexo
JOIN estados_pedidos  e  ON a.estado       = e.id
JOIN tipo_servicio    x  ON x.id           = a.tipo_servicio
JOIN empleados        pp ON pp.ident       = pa.empleado
LEFT JOIN causale_no_pedidos y ON y.id     = a.causal
ORDER BY a.id DESC, pa.id DESC;
