import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class PedidosService {
  constructor(private readonly dataSource: DataSource) {}

  async findAll() {
    // Columnas requeridas por ListadoPedidosPage (23 columnas confirmadas):
    //   pedido, perfil, nit, nombre, fecha_pedido, fecha_inicio, fecha_final,
    //   hora_inicio, hora_final, nro_personas, faltante, sexo (nombre), tipo_servicio,
    //   valor_servicio, asesor, auxiliares, riesgo_arl, per_recomendacion (personas_recomendacion),
    //   bonificacion, observaciones, usuario, estado (integer FK), id_sexo
    // faltante: columna integer en pedidos_personal (confirmado en findEnviadosCoordinador)
    // auxiliares: STRING_AGG de empleados asignados via pedidos_asignados
    // estado: integer FK retornado directo (estadoColor en frontend maneja número)
    // usuario: p.usuario (quien registró el pedido)
    return this.dataSource.query(
      `SELECT DISTINCT ON (pp.id)
         pp.id_pedido                                              AS pedido,
         b.nombre                                                  AS perfil,
         p.nit,
         p.nombre,
         p.fecha_pedido,
         pp.fecha_inicio,
         pp.fecha_final,
         pp.hora_inicio,
         pp.hora_final,
         pp.nro_personas,
         pp.faltante,
         s.nombre                                                  AS sexo,
         x.nombre                                                  AS tipo_servicio,
         pp.valor_servicio,
         p.nombre_asesor                                           AS asesor,
         (SELECT STRING_AGG(func_nombre_empleado(pa.empleado), ', ')
          FROM pedidos_asignados pa
          WHERE pa.id_pedido_personal = pp.id)                     AS auxiliares,
         pp.riesgo_arl,
         pp.per_recomendacion,
         pp.bonificacion,
         pp.observaciones,
         p.usuario,
         pp.estado,
         pp.sexo                                                   AS id_sexo
       FROM pedidos_personal pp
       JOIN      pedidos          p  ON p.id          = pp.id_pedido
       LEFT JOIN perfiles         b  ON b.id           = pp.tipo_perfil
       LEFT JOIN sexo             s  ON s.id           = pp.sexo
       LEFT JOIN tipo_servicio    x  ON x.id           = pp.tipo_servicio
       ORDER BY pp.id DESC
       LIMIT 2000`,
    );
  }

  async findPersonal() {
    // Confirmed real columns on pedidos_personal (from RegistraPedidosPage usage):
    //   hora_inicio, hora_final, bonificacion, riesgo_arl, per_recomendacion
    // "faltante" does NOT exist in pedidos_personal — returned as NULL::text
    // p.nombre_asesor aliased as asesor (commercial advisor), p.usuario is who registered
    // Maestras (perfiles, sexo, estados_pedidos, tipo_servicio) usan LEFT JOIN para
    // evitar que filas con FK sin match sean excluidas silenciosamente.
    return this.dataSource.query(
      `SELECT
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
       JOIN      pedidos          p  ON p.id          = pp.id_pedido
       LEFT JOIN clientes         c  ON c.ident        = p.nit
       LEFT JOIN perfiles         b  ON b.id           = pp.tipo_perfil
       LEFT JOIN sexo             s  ON s.id           = pp.sexo
       LEFT JOIN estados_pedidos  e  ON e.id           = pp.estado
       LEFT JOIN tipo_servicio    x  ON x.id           = pp.tipo_servicio
       ORDER BY pp.id_pedido DESC
       LIMIT 2000`,
    );
  }

  async findPersonalProgramados() {
    // Full JOIN query for Pedidos Personal Programados page (estado = 2).
    // Confirmed real columns on pedidos_personal:
    //   hora_inicio, hora_final, bonificacion, riesgo_arl, per_recomendacion
    // "faltante" does NOT exist — returned as NULL::text
    // FIX: clientes cambiado a LEFT JOIN — el INNER JOIN excluía pedidos cuyo nit
    // no matchea en la tabla clientes (datos históricos 2024 sin cliente vigente),
    // causando 0 filas retornadas silenciosamente.
    // Todas las maestras (perfiles, sexo, estados_pedidos, tipo_servicio) siguen
    // como LEFT JOIN para evitar exclusiones por FK sin match.
    const sql = `SELECT
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
       JOIN      pedidos          p  ON p.id          = pp.id_pedido
       LEFT JOIN clientes         c  ON c.ident        = p.nit
       LEFT JOIN perfiles         b  ON b.id           = pp.tipo_perfil
       LEFT JOIN sexo             s  ON s.id           = pp.sexo
       LEFT JOIN estados_pedidos  e  ON e.id           = pp.estado
       LEFT JOIN tipo_servicio    x  ON x.id           = pp.tipo_servicio
       WHERE pp.estado IN (1, 2, 5, 6)
       ORDER BY pp.id_pedido DESC
       LIMIT 2000`;
    console.log('[pedidos/personal-programados] ejecutando query, estado IN (1,2,5,6)');
    const rows = await this.dataSource.query(sql);
    console.log(`[pedidos/personal-programados] filas retornadas: ${rows.length}`);
    return rows;
  }

  async findAnulados() {
    // Pedidos Anulados: diferenciador confirmado estado = 3 (CANCELADO) — 292 registros al 2026-05-23.
    // Campos inciertos resueltos:
    //   faltante   → NULL::text  (columna no existe en pedidos_personal)
    //   sexo       → LEFT JOIN sexo s ON s.id = pp.sexo  → s.nombre AS sexo
    //   riesgo_arl → pp.riesgo_arl (integer código); tabla riesgo_arl solo tiene codigo+usuario, sin nombre
    //   per_recomendacion → pp.per_recomendacion (text directo)
    //   causal     → LEFT JOIN causale_no_pedidos cn ON cn.id = pp.causal  → cn.nombre AS causal
    //   usuario    → LEFT JOIN usuarios u ON u.id = pp.usuario → u.usuario AS usuario
    return this.dataSource.query(
      `SELECT
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
       ORDER BY pp.id_pedido DESC
       LIMIT 2000`,
    );
  }

  async findFacturados() {
    // Pedidos Facturados: registros de pedidos_personal con estado en área de facturación.
    //   estados_pedidos confirmados en BD:
    //     id=5  FACTURADO           area='TERMINO CICLO EN FACTURACIÓN'
    //     id=6  ENVIADO COORDINADOR area='FACTURACIÓN'
    // Ambas áreas incluidas: pedido 11160 (estado=6) estaba ausente con filtro solo id=5.
    return this.dataSource.query(
      `SELECT
         pp.id_pedido                                            AS pedido,
         pp.id                                                   AS id_pedido_personal,
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
       WHERE ep.area IN ('TERMINO CICLO EN FACTURACIÓN', 'FACTURACIÓN')
       ORDER BY pp.id_pedido DESC
       LIMIT 2000`,
    );
  }

  async updateFacturado(id: number, facturado: string) {
    // id aquí es pedidos_personal.id (id_pedido_personal), no id_pedido
    await this.dataSource.query(
      `UPDATE pedidos_personal SET facturado = $2 WHERE id = $1`,
      [id, facturado],
    );
    return { success: true, id, facturado };
  }

  async findAFacturar() {
    // Pedidos a Facturar: registros de pedidos_personal cuyo estado tiene area = 'FACTURACIÓN'.
    //   estados_pedidos confirmados en BD:
    //     id=6  ENVIADO COORDINADOR  area='FACTURACIÓN'         ← único estado a facturar
    //     id=5  FACTURADO            area='TERMINO CICLO EN FACTURACIÓN'  ← ya facturado, NO incluir
    // El filtro es ep.area = 'FACTURACIÓN' (JOIN a estados_pedidos), no por id hardcodeado,
    // para que sobreviva futuros cambios en la tabla de estados.
    return this.dataSource.query(
      `SELECT
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
       ORDER BY pp.id_pedido DESC
       LIMIT 2000`,
    );
  }

  async findEnviadosCoordinador() {
    // Pedidos Enviados al Coordinador: diferenciador real = enviado_coordinador = 'Si' (cualquier estado).
    // Distribución confirmada: 2430 registros con 'Si' (estados 3, 5, 6), solo 13 tenían estado=6.
    // faltante: existe en pedidos_personal como integer; retornado directamente.
    // sexo: FK pp.sexo → sexo.id → s.nombre
    // tipo_servicio: FK pp.tipo_servicio → tipo_servicio.id → x.nombre
    // contacto/telefono: vienen de clientes (c.contacto, c.telefono), join via p.id_cliente = c.id
    // usuario: pp.usuario es integer FK; retornado como pp.usuario (raw)
    // total_servicio: COALESCE(valor_servicio,0) + COALESCE(bonificacion,0)
    return this.dataSource.query(
      `SELECT
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
       ORDER BY pp.id_pedido DESC
       LIMIT 2000`,
    );
  }

  async findEpp() {
    return this.dataSource.query(
      `SELECT * FROM view_pedidos_epp ORDER BY id DESC LIMIT 2000`,
    );
  }

  async findEppDotacion() {
    // view_pedidos_personal_dot_epp has 1:N JOIN (pedidos_dot_epp -> pedidos_personal)
    // causing row multiplication. Inlined with DISTINCT ON (xx.id) to get one row
    // per dotacion/EPP detail line — the natural grain of this view is per EPP item.
    // Real columns on pedidos_dot_epp: id, id_pedido, tipo, id_item, nombre_item,
    //   cantidad, ident_empleado, procesado, estado, usuario.
    return this.dataSource.query(
      `SELECT DISTINCT ON (xx.id)
         xx.id                  AS id_ped_dot_epp,
         xx.id_pedido,
         xx.ident_empleado,
         xx.id_item,
         xx.cantidad,
         xx.procesado,
         xx.tipo,
         xx.nombre_item,
         p.nit,
         p.nombre,
         p.fecha_pedido,
         a.id_pedido            AS id_pedido_personal,
         a.tipo_perfil,
         a.sexo,
         a.estado,
         a.tipo_servicio,
         a.fecha_inicio,
         a.fecha_final,
         a.nro_personas,
         a.valor_servicio,
         a.bonificacion,
         b.nombre               AS perfil,
         s.nombre               AS genero,
         c.nombre               AS estado_nombre,
         x.nombre               AS tipo_servicio_nombre,
         ee.nombre              AS nombre_empleado,
         ee.ident               AS ident_empleado_ident
       FROM pedidos_dot_epp xx
       JOIN pedidos_personal a  ON a.id_pedido   = xx.id_pedido
       JOIN pedidos          p  ON a.id_pedido   = p.id
       JOIN perfiles         b  ON a.tipo_perfil = b.id
       JOIN sexo             s  ON s.id          = a.sexo
       JOIN estados_pedidos  c  ON a.estado      = c.id
       JOIN tipo_servicio    x  ON x.id          = a.tipo_servicio
       JOIN empleados        ee ON ee.ident      = xx.ident_empleado
       WHERE xx.procesado != 'SI'
       ORDER BY xx.id DESC, xx.id_pedido DESC
       LIMIT 2000`,
    );
  }

  async findEppDotacionProcesado() {
    // Same fix as findEppDotacion — DISTINCT ON (xx.id) per EPP detail line
    // Real columns on pedidos_dot_epp: id, id_pedido, tipo, id_item, nombre_item,
    //   cantidad, ident_empleado, procesado, estado, usuario.
    return this.dataSource.query(
      `SELECT DISTINCT ON (xx.id)
         xx.id                  AS id_ped_dot_epp,
         xx.id_pedido,
         xx.ident_empleado,
         xx.id_item,
         xx.cantidad,
         xx.procesado,
         xx.tipo,
         xx.nombre_item,
         p.nit,
         p.nombre,
         p.fecha_pedido,
         a.id_pedido            AS id_pedido_personal,
         a.tipo_perfil,
         a.sexo,
         a.estado,
         a.tipo_servicio,
         a.fecha_inicio,
         a.fecha_final,
         a.nro_personas,
         a.valor_servicio,
         a.bonificacion,
         b.nombre               AS perfil,
         s.nombre               AS genero,
         c.nombre               AS estado_nombre,
         x.nombre               AS tipo_servicio_nombre,
         ee.nombre              AS nombre_empleado,
         ee.ident               AS ident_empleado_ident
       FROM pedidos_dot_epp xx
       JOIN pedidos_personal a  ON a.id_pedido   = xx.id_pedido
       JOIN pedidos          p  ON a.id_pedido   = p.id
       JOIN perfiles         b  ON a.tipo_perfil = b.id
       JOIN sexo             s  ON s.id          = a.sexo
       JOIN estados_pedidos  c  ON a.estado      = c.id
       JOIN tipo_servicio    x  ON x.id          = a.tipo_servicio
       JOIN empleados        ee ON ee.ident      = xx.ident_empleado
       WHERE xx.procesado = 'SI'
       ORDER BY xx.id DESC, xx.id_pedido DESC
       LIMIT 2000`,
    );
  }

  async procesarEppDotacion(ids: number[]) {
    await this.dataSource.query(
      `UPDATE pedidos_dot_epp SET procesado = 'SI' WHERE id = ANY($1)`,
      [ids],
    );
    return { success: true, processed: ids.length };
  }

  async findEmpleados() {
    // view_pedidos_personal_empleados has 1:N via pedidos_asignados (multiple employees
    // per profile per order). Fixed with DISTINCT ON (a.id) — one row per pedidos_personal
    // line, taking the most recently assigned employee (ORDER BY pa.id DESC).
    const sql = `
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
      ORDER BY a.id DESC, pa.id DESC
      LIMIT 2000`;
    console.log('[pedidos/empleados] SQL (inline, deduped)');
    return this.dataSource.query(sql);
  }

  async findAreas() {
    return this.dataSource.query(
      `SELECT DISTINCT ON (p.id)
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
       ORDER BY p.id DESC, pp.id DESC
       LIMIT 1000`,
    );
  }

  async findEspeciales() {
    return this.dataSource.query(
      `SELECT DISTINCT ON (p.id)
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
       ORDER BY p.id DESC, pe.id ASC
       LIMIT 2000`,
    );
  }

  async findEspecialesProgramados() {
    // Pedidos Especiales Programados — uses pedidos_equipos (special orders).
    // Equipos are inserted with estado = 1 (active/programado) via registrarEspecial.
    // No workflow exists to transition to estado = 2, so we filter estado = 1.
    // coordinador_operativo and nro_pedido_fisico: columns do not exist in DB,
    // returned as NULL until confirmed/added to the schema.
    return this.dataSource.query(
      `SELECT DISTINCT ON (p.id)
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
       ORDER BY p.id DESC, pe.id ASC
       LIMIT 2000`,
    );
  }

  async findEspecialesAreas() {
    // Retorna exactamente las 17 columnas requeridas por la página Pedidos Especiales Áreas.
    // Campos confirmados en view_pedidos_equipos / pedidos_equipos / pedidos.
    // auxiliares: NULL — no existe tabla que relacione empleados con pedidos_equipos.
    // coordinador_operativo: NULL — columna no existe en ninguna tabla de la BD.
    return this.dataSource.query(
      `SELECT
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
       ORDER BY v.id_pedido DESC
       LIMIT 2000`,
    );
  }

  async findSupervision() {
    // Reporte Supervisión — retorna las 9 columnas requeridas por PedidosPersonalReportePage:
    //   fecha_inicio, fecha_final, n_tipo_servicio, nombre, asesor (coordinador),
    //   nro_personas, id_pedido, presta_servicio (= a.facturado: "Si"/"No"),
    //   causa_no_instalacion (= causal_nombre desde causale_no_pedidos).
    // DISTINCT ON (a.id) deduplica por pedidos_asignados 1:N.
    // clientes: LEFT JOIN para no excluir pedidos históricos sin cliente vigente.
    return this.dataSource.query(
      `SELECT DISTINCT ON (a.id)
         a.id_pedido,
         a.fecha_inicio,
         a.fecha_final,
         a.nro_personas,
         a.estado,
         p.nit,
         p.nombre,
         p.nombre_asesor          AS asesor,
         x.nombre                 AS n_tipo_servicio,
         a.facturado               AS presta_servicio,
         y.nombre                 AS causa_no_instalacion
       FROM pedidos_personal a
       JOIN      pedidos          p  ON a.id_pedido   = p.id
       LEFT JOIN clientes         c  ON c.ident        = p.nit
       LEFT JOIN pedidos_asignados pa ON pa.id_pedido  = a.id_pedido
                                     AND a.tipo_perfil = pa.perfil
       LEFT JOIN tipo_servicio    x  ON x.id           = a.tipo_servicio
       LEFT JOIN causale_no_pedidos y ON y.id          = a.causal
       WHERE a.estado IN (5, 6)
       ORDER BY a.id DESC, pa.id DESC
       LIMIT 2000`,
    );
  }

  async anularPersonal(id: number) {
    await this.dataSource.query(
      `UPDATE pedidos_personal SET estado = 3 WHERE id = $1`,
      [id],
    );
    return { success: true, id };
  }

  async programarPersonal(id: number) {
    await this.dataSource.query(
      `UPDATE pedidos_personal SET estado = 2 WHERE id = $1`,
      [id],
    );
    return { success: true, id };
  }

  async enviarCoordinador(id: number) {
    await this.dataSource.query(
      `UPDATE pedidos_personal SET enviado_coordinador = 'S', estado = 6 WHERE id = $1`,
      [id],
    );
    return { success: true, id };
  }

  async create(data: Record<string, unknown>) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const cols = keys.join(', ');
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');

    const result = await this.dataSource.query(
      `INSERT INTO pedidos (${cols}) VALUES (${placeholders}) RETURNING id`,
      values,
    );
    return result[0];
  }

  async createPersonal(pedidoId: number, data: Record<string, unknown>) {
    const payload = { ...data, id_pedido: pedidoId };
    // Remove fields that belong only to pedidos, not pedidos_personal
    const exclude = new Set(['id', 'facturado', 'personas_esp', 'dias_esp', 'mano_obra_esp']);
    const filtered = Object.fromEntries(
      Object.entries(payload).filter(([k]) => !exclude.has(k)),
    );

    const keys = Object.keys(filtered);
    const values = Object.values(filtered);
    const cols = keys.join(', ');
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');

    const result = await this.dataSource.query(
      `INSERT INTO pedidos_personal (${cols}) VALUES (${placeholders}) RETURNING id`,
      values,
    );
    return result[0];
  }

  async createEspecial(data: Record<string, unknown>) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const cols = keys.join(', ');
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');

    const result = await this.dataSource.query(
      `INSERT INTO pedidos (${cols}) VALUES (${placeholders}) RETURNING id`,
      values,
    );
    return result[0];
  }

  async registrar(
    pedidoData: Record<string, unknown>,
    personalList: Record<string, unknown>[],
  ) {
    return await this.dataSource.transaction(async (manager) => {
      const pKeys = Object.keys(pedidoData);
      const pVals = Object.values(pedidoData);
      const [pedido] = await manager.query(
        `INSERT INTO pedidos (${pKeys.join(', ')}) VALUES (${pKeys.map((_, i) => `$${i + 1}`).join(', ')}) RETURNING id`,
        pVals,
      );
      for (const pp of personalList) {
        const row = {
          ...pp,
          id_pedido: pedido.id,
          estado: 1,
          facturado: 'No',
          enviado_coordinador: 'N',
        };
        const rKeys = Object.keys(row);
        const rVals = Object.values(row);
        await manager.query(
          `INSERT INTO pedidos_personal (${rKeys.join(', ')}) VALUES (${rKeys.map((_, i) => `$${i + 1}`).join(', ')})`,
          rVals,
        );
      }
      return pedido;
    });
  }

  async registrarEspecial(
    pedidoData: Record<string, unknown>,
    equiposList: Record<string, unknown>[],
  ) {
    return await this.dataSource.transaction(async (manager) => {
      const pKeys = Object.keys(pedidoData);
      const pVals = Object.values(pedidoData);
      const [pedido] = await manager.query(
        `INSERT INTO pedidos (${pKeys.join(', ')}) VALUES (${pKeys.map((_, i) => `$${i + 1}`).join(', ')}) RETURNING id`,
        pVals,
      );
      for (const eq of equiposList) {
        const row = { ...eq, id_pedido: pedido.id, estado: 1, facturado: 'No' };
        const rKeys = Object.keys(row);
        const rVals = Object.values(row);
        await manager.query(
          `INSERT INTO pedidos_equipos (${rKeys.join(', ')}) VALUES (${rKeys.map((_, i) => `$${i + 1}`).join(', ')})`,
          rVals,
        );
      }
      return pedido;
    });
  }

  async updateEspecial(id: number, pedidoData: Record<string, unknown>) {
    const keys = Object.keys(pedidoData);
    const values = Object.values(pedidoData);
    const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    await this.dataSource.query(
      `UPDATE pedidos SET ${setClause} WHERE id = $${keys.length + 1}`,
      [...values, id],
    );
    return { success: true, id };
  }

  async deleteEspecial(id: number) {
    await this.dataSource.query(`DELETE FROM pedidos_equipos WHERE id_pedido = $1`, [id]);
    await this.dataSource.query(`DELETE FROM pedidos WHERE id = $1`, [id]);
    return { success: true };
  }
}
