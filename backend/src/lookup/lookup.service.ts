import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class LookupService {
  constructor(private readonly dataSource: DataSource) {}

  getClientes() {
    return this.dataSource.query(
      `SELECT codigo AS id, ident AS nit, nombre, direccion, telefono, contacto, ciudad_codigo AS ciudad
       FROM clientes WHERE activo = true ORDER BY nombre`,
    );
  }

  getPerfiles() {
    return this.dataSource.query(
      `SELECT id, nombre FROM perfiles ORDER BY nombre`,
    );
  }

  getTipoServicio() {
    return this.dataSource.query(
      `SELECT id, nombre FROM tipo_servicio ORDER BY nombre`,
    );
  }

  getSectores() {
    return this.dataSource.query(
      `SELECT codigo AS id, nombre FROM sectores ORDER BY nombre`,
    );
  }

  getRiesgoArl() {
    return this.dataSource.query(
      `SELECT codigo AS id FROM riesgo_arl ORDER BY codigo`,
    );
  }

  getCiudades() {
    return this.dataSource.query(
      `SELECT codigo, nombre FROM ciudades ORDER BY nombre LIMIT 400`,
    );
  }

  getTipoEquipo() {
    return this.dataSource.query(
      `SELECT id, nombre FROM tipo_equipo ORDER BY nombre`,
    );
  }

  async getEmpleado(codigo: number) {
    const [row] = await this.dataSource.query(
      `SELECT codigo, nombre, ident FROM empleados WHERE codigo = $1 LIMIT 1`,
      [codigo],
    );
    return row ?? null;
  }

  getCausales() {
    return this.dataSource.query(
      `SELECT id, nombre FROM causal_terminacion_contrato ORDER BY nombre`,
    );
  }

  getProfesiones() {
    return this.dataSource.query(
      `SELECT codigo AS id, nombre FROM profesiones ORDER BY nombre`,
    );
  }

  getSexo() {
    return this.dataSource.query(
      `SELECT id, nombre FROM sexo ORDER BY id`,
    );
  }
}
