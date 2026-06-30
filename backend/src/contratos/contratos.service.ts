import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateContratoDto } from './contratos.dto';
import { UpdateContratoDto } from './contratos.dto';

@Injectable()
export class ContratosService {
  constructor(private readonly dataSource: DataSource) {}

  /** Resuelve el id entero del usuario a partir del email del JWT. */
  private async resolveUsuarioId(email?: string): Promise<number | null> {
    if (!email) return null;
    const [row] = await this.dataSource.query(
      `SELECT id FROM usuarios WHERE email = $1 LIMIT 1`,
      [email],
    );
    return row?.id ?? null;
  }

  async findAll(anulados = false) {
    const whereClause = anulados
      ? `WHERE COALESCE(anulado, false) = true`
      : `WHERE COALESCE(anulado, false) = false`;
    return this.dataSource.query(
      `SELECT * FROM terminacion_contrato_view ${whereClause} ORDER BY id DESC LIMIT 500`,
    );
  }

  async findTerminados() {
    return this.dataSource.query(
      `SELECT * FROM terminacion_contrato_view
       WHERE tipo IN ('Terminacion', 'Disminución')
         AND COALESCE(anulado, false) = false
       ORDER BY id DESC`,
    );
  }

  async create(data: CreateContratoDto, email?: string) {
    const usuario = (await this.resolveUsuarioId(email)) ?? 1;

    const result = await this.dataSource.query(
      `INSERT INTO terminacion_contrato
         (fecha, id_cliente, personas, fecha_inicio, fecha_terminacion,
          id_supervisor, id_causa, tipo, perfil, observacion, usuario,
          gestion_humana, facturacion, terminado, prestacion_servicio,
          usuario_prestacion_servicio, usuario_factura, usuario_gestion_humana,
          id_pedido, anulado)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
               'NO', 'NO', 'NO', 'NO', '', '', '', 0, false)
       RETURNING id`,
      [
        data.fecha,
        data.id_cliente,
        data.personas,
        data.fecha_inicio,
        data.fecha_terminacion,
        data.id_supervisor,
        data.id_causa,
        data.tipo ?? 1,
        data.perfil ?? null,
        data.observacion ?? null,
        usuario,
      ],
    );

    const [row] = await this.dataSource.query(
      `SELECT * FROM terminacion_contrato_view WHERE id = $1`,
      [result[0].id],
    );
    return row;
  }

  async update(id: number, data: UpdateContratoDto) {
    const [existing] = await this.dataSource.query(
      `SELECT id FROM terminacion_contrato WHERE id = $1`,
      [id],
    );
    if (!existing) throw new NotFoundException(`Contrato ${id} no encontrado`);

    const sets: string[] = [];
    const params: unknown[] = [];
    let i = 1;

    const fields: (keyof UpdateContratoDto)[] = [
      'fecha', 'id_cliente', 'personas', 'fecha_inicio', 'fecha_terminacion',
      'id_supervisor', 'id_causa', 'tipo', 'perfil', 'observacion',
    ];

    for (const field of fields) {
      if (data[field] !== undefined) {
        sets.push(`${field} = $${i++}`);
        params.push(data[field]);
      }
    }

    if (sets.length) {
      params.push(id);
      await this.dataSource.query(
        `UPDATE terminacion_contrato SET ${sets.join(', ')} WHERE id = $${i}`,
        params,
      );
    }

    const [row] = await this.dataSource.query(
      `SELECT * FROM terminacion_contrato_view WHERE id = $1`,
      [id],
    );
    return row;
  }

  /** Anula (inactiva) el contrato sin borrarlo de la base de datos. */
  async anular(id: number, email?: string) {
    const [existing] = await this.dataSource.query(
      `SELECT id FROM terminacion_contrato WHERE id = $1`,
      [id],
    );
    if (!existing) throw new NotFoundException(`Contrato ${id} no encontrado`);

    const usuario = await this.resolveUsuarioId(email);
    await this.dataSource.query(
      `UPDATE terminacion_contrato
         SET anulado = true, usuario_anula = $2, fecha_anula = NOW()
       WHERE id = $1`,
      [id, usuario],
    );
    return { id, anulado: true };
  }

  async remove(id: number) {
    const [existing] = await this.dataSource.query(
      `SELECT id FROM terminacion_contrato WHERE id = $1`,
      [id],
    );
    if (!existing) throw new NotFoundException(`Contrato ${id} no encontrado`);

    await this.dataSource.query(
      `DELETE FROM terminacion_contrato WHERE id = $1`,
      [id],
    );
  }
}
