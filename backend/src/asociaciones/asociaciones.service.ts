import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class AsociacionesService {
  constructor(private readonly db: DataSource) {}

  // ──────────────── EMPLEADOS-PERFIL ────────────────
  async listEmpleadosPerfil(opts: { search?: string; perfil?: number; page?: number; limit?: number } = {}) {
    const { search, perfil, page = 1, limit = 50 } = opts;
    const offset = (page - 1) * limit;
    const conditions: string[] = [];
    const params: unknown[] = [];
    let i = 1;

    if (search) {
      conditions.push(`(nombre ILIKE $${i} OR ident::text ILIKE $${i})`);
      params.push(`%${search}%`); i++;
    }
    if (perfil) {
      conditions.push(`id_perfil = $${i}`);
      params.push(perfil); i++;
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const [rows, countRes] = await Promise.all([
      this.db.query(
        `SELECT codigo, ident, nombre, id_perfil, perfil
         FROM public.view_empleados
         ${where}
         ORDER BY nombre
         LIMIT $${i} OFFSET $${i + 1}`,
        [...params, limit, offset],
      ),
      this.db.query(
        `SELECT COUNT(*)::int AS total FROM public.view_empleados ${where}`,
        params,
      ),
    ]);

    return { data: rows, total: countRes[0].total, page, limit };
  }

  async createEmpleadoPerfil(empleadoIdent: string, perfilId: number) {
    await this.db.query(
      'UPDATE empleados SET perfil = $1 WHERE ident = $2',
      [perfilId, empleadoIdent],
    );
    const rows = await this.db.query(
      'SELECT codigo, ident, nombre, id_perfil, perfil FROM public.view_empleados WHERE ident = $1',
      [empleadoIdent],
    );
    return rows[0];
  }

  async deleteEmpleadoPerfil(empleadoIdent: string, _perfilId: number) {
    await this.db.query(
      'UPDATE empleados SET perfil = NULL WHERE ident = $1',
      [empleadoIdent],
    );
  }

  // ──────────────── SUPERNUMERARIOS ────────────────
  listSupernumerarios(search?: string) {
    const where = search
      ? `WHERE nombre_auxiliar ILIKE $1 OR nombre_supernumerario ILIKE $1`
      : '';
    const params = search ? [`%${search}%`] : [];
    return this.db.query(
      `SELECT * FROM view_supernumerarios_auxiliares ${where} ORDER BY nombre_auxiliar`,
      params,
    );
  }

  async createSupernumerario(data: { id_auxiliar: string; id_supernumerario: string }) {
    await this.db.query(
      `INSERT INTO supernumerarios_auxiliares (id_auxiliar, id_supernumerario, activo, usuario)
       VALUES ($1, $2, true, 1)
       ON CONFLICT DO NOTHING`,
      [data.id_auxiliar, data.id_supernumerario],
    );
    return data;
  }

  async deleteSupernumerario(auxiliar: string, supernumerario: string) {
    await this.db.query(
      'UPDATE supernumerarios_auxiliares SET activo = false WHERE id_auxiliar = $1 AND id_supernumerario = $2',
      [auxiliar, supernumerario],
    );
  }

  // ──────────────── PERFILES-CAPACITACION ────────────────
  listPerfilesCapacitacion(search?: string) {
    const where = search ? `WHERE perfil ILIKE $1 OR capacitacion ILIKE $1` : '';
    const params = search ? [`%${search}%`] : [];
    return this.db.query(
      `SELECT * FROM view_asociacion_perfiles_capacitaciones ${where} ORDER BY perfil, capacitacion`,
      params,
    );
  }

  async createPerfilCapacitacion(data: { codigo_perfil: number; codigo_capacitacion: number }) {
    await this.db.query(
      `INSERT INTO asociacion_perfiles_capacitaciones (codigo_perfil, codigo_capacitacion, usuario)
       VALUES ($1, $2, 1) ON CONFLICT DO NOTHING`,
      [data.codigo_perfil, data.codigo_capacitacion],
    );
    return data;
  }

  async deletePerfilCapacitacion(perfil: number, capacitacion: number) {
    await this.db.query(
      'DELETE FROM asociacion_perfiles_capacitaciones WHERE codigo_perfil = $1 AND codigo_capacitacion = $2',
      [perfil, capacitacion],
    );
  }

  // ──────────────── CUADRILLAS ────────────────
  listCuadrillas(search?: string) {
    const where = search ? `WHERE nombre ILIKE $1 OR empleado ILIKE $1` : '';
    const params = search ? [`%${search}%`] : [];
    return this.db.query(
      `SELECT * FROM view_asociacion_cuadrillas_especiales ${where} ORDER BY nombre, empleado`,
      params,
    );
  }

  async createCuadrilla(data: { codigo_cuadrilla: number; codigo_empleado: number }) {
    await this.db.query(
      `INSERT INTO asociacion_cuadrillas_especiales (codigo_cuadrilla, codigo_empleado, activo, usuario)
       VALUES ($1, $2, true, 1) ON CONFLICT DO NOTHING`,
      [data.codigo_cuadrilla, data.codigo_empleado],
    );
    return data;
  }

  async deleteCuadrilla(cuadrilla: number, empleado: number) {
    await this.db.query(
      'UPDATE asociacion_cuadrillas_especiales SET activo = false WHERE codigo_cuadrilla = $1 AND codigo_empleado = $2',
      [cuadrilla, empleado],
    );
  }

  // ──────────────── PERFILES-EPP ────────────────
  listPerfilesEPP(search?: string) {
    const where = search ? `WHERE perfil ILIKE $1 OR nombre_epp ILIKE $1` : '';
    const params = search ? [`%${search}%`] : [];
    return this.db.query(
      `SELECT * FROM view_asociacion_perfiles_epp ${where} ORDER BY perfil, nombre_epp`,
      params,
    );
  }

  async createPerfilEPP(data: { codigo_perfil: number; codigo_epp: number }) {
    await this.db.query(
      `INSERT INTO asociacion_perfiles_epp (codigo_perfil, codigo_epp, usuario)
       VALUES ($1, $2, 1) ON CONFLICT DO NOTHING`,
      [data.codigo_perfil, data.codigo_epp],
    );
    return data;
  }

  async deletePerfilEPP(perfil: number, epp: number) {
    await this.db.query(
      'DELETE FROM asociacion_perfiles_epp WHERE codigo_perfil = $1 AND codigo_epp = $2',
      [perfil, epp],
    );
  }

  // ──────────────── MYE-IMPLEMENTOS ────────────────
  listMYEImplementos(search?: string) {
    const where = search ? `WHERE nombre_tipo_equipo ILIKE $1 OR nombre_implemento ILIKE $1` : '';
    const params = search ? [`%${search}%`] : [];
    return this.db.query(
      `SELECT * FROM view_asociacion_mye_implementos ${where} ORDER BY nombre_tipo_equipo, nombre_implemento`,
      params,
    );
  }

  async createMYEImplemento(data: { codigo_tipo_equipo: number; codigo_implemento: number }) {
    await this.db.query(
      `INSERT INTO asociacion_mye_implementos (codigo_tipo_equipo, codigo_implemento, usuario)
       VALUES ($1, $2, 1) ON CONFLICT DO NOTHING`,
      [data.codigo_tipo_equipo, data.codigo_implemento],
    );
    return data;
  }

  async deleteMYEImplemento(equipo: number, implemento: number) {
    await this.db.query(
      'DELETE FROM asociacion_mye_implementos WHERE codigo_tipo_equipo = $1 AND codigo_implemento = $2',
      [equipo, implemento],
    );
  }

  // ──────────────── OPTIONS (dropdowns) ────────────────
  getPerfilesOptions() {
    return this.db.query('SELECT id AS value, nombre AS label FROM perfiles ORDER BY nombre');
  }

  getCapacitacionesOptions() {
    return this.db.query("SELECT codigo AS value, nombre AS label FROM capacitaciones WHERE nombre IS NOT NULL AND nombre != '' ORDER BY nombre");
  }

  getEPPOptions() {
    return this.db.query('SELECT codigo AS value, nombre AS label FROM articulos WHERE activo = true ORDER BY nombre');
  }

  getImplementosOptions() {
    return this.db.query('SELECT codigo AS value, nombre AS label FROM implementos ORDER BY nombre');
  }

  getTipoEquipoOptions() {
    return this.db.query('SELECT id AS value, nombre AS label FROM tipo_equipo ORDER BY nombre');
  }

  getCuadrillasOptions() {
    return this.db.query('SELECT id AS value, nombre AS label FROM cuadrillas_especiales ORDER BY nombre');
  }

  getEmpleadosOptions() {
    return this.db.query(
      'SELECT ident AS value, nombre AS label FROM empleados WHERE activo = true ORDER BY nombre LIMIT 1000',
    );
  }
}
