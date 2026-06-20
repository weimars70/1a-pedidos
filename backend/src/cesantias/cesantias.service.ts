import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class CesantiasService {
  constructor(private readonly dataSource: DataSource) {}

  async findAll(opts: {
    search?: string;
    empleado?: string;
    fechaDesde?: string;
    fechaHasta?: string;
    page?: number;
    limit?: number;
  } = {}) {
    const { search, empleado, fechaDesde, fechaHasta, page = 1, limit = 50 } = opts;
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const params: unknown[] = [];
    let i = 1;

    if (search) {
      conditions.push(`(f.empleado ILIKE $${i} OR e.nombre ILIKE $${i})`);
      params.push(`%${search}%`); i++;
    }
    if (empleado) {
      conditions.push(`(f.empleado ILIKE $${i} OR e.nombre ILIKE $${i})`);
      params.push(`%${empleado}%`); i++;
    }
    if (fechaDesde) {
      conditions.push(`f.fecha >= $${i}`);
      params.push(fechaDesde); i++;
    }
    if (fechaHasta) {
      conditions.push(`f.fecha <= $${i}`);
      params.push(fechaHasta); i++;
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const rows = await this.dataSource.query(
      `SELECT f.id, f.empleado, f.fecha::date AS fecha,
              convert_from(f.firma, 'UTF8') AS firma, e.nombre
       FROM firma_digital f
       LEFT JOIN empleados e ON e.ident = f.empleado
       ${where}
       ORDER BY f.id DESC
       LIMIT $${i} OFFSET $${i + 1}`,
      [...params, limit, offset],
    );

    const [{ total }] = await this.dataSource.query(
      `SELECT COUNT(*)::int AS total
       FROM firma_digital f
       LEFT JOIN empleados e ON e.ident = f.empleado
       ${where}`,
      params,
    );

    return { data: rows, total, page, limit };
  }

  async findOne(id: number) {
    const rows = await this.dataSource.query(
      `SELECT
         f.id,
         f.empleado,
         f.fecha::date AS fecha,
         convert_from(f.firma, 'UTF8') AS firma,
         e.nombre
       FROM firma_digital f
       LEFT JOIN empleados e ON e.ident = f.empleado
       WHERE f.id = $1`,
      [id],
    );
    if (!rows[0]) throw new NotFoundException(`Registro ${id} no encontrado`);
    return rows[0];
  }

  async create(data: { empleado: string; fecha: string; firma: string; usuario?: number }) {
    const result = await this.dataSource.query(
      `INSERT INTO firma_digital (empleado, fecha, firma, usuario)
       VALUES ($1, $2, $3::bytea, $4)
       RETURNING id`,
      [
        data.empleado,
        data.fecha,
        Buffer.from(data.firma, 'utf8'),
        data.usuario ?? 1,
      ],
    );
    return this.findOne(result[0].id);
  }

  async update(id: number, data: Partial<{ empleado: string; fecha: string; firma: string }>) {
    await this.findOne(id);
    const sets: string[] = [];
    const params: unknown[] = [];
    let i = 1;
    if (data.empleado !== undefined) { sets.push(`empleado = $${i++}`); params.push(data.empleado); }
    if (data.fecha !== undefined) { sets.push(`fecha = $${i++}`); params.push(data.fecha); }
    if (data.firma !== undefined) { sets.push(`firma = $${i++}::bytea`); params.push(Buffer.from(data.firma, 'utf8')); }
    if (sets.length) {
      params.push(id);
      await this.dataSource.query(`UPDATE firma_digital SET ${sets.join(', ')} WHERE id = $${i}`, params);
    }
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.dataSource.query('DELETE FROM firma_digital WHERE id = $1', [id]);
  }
}
