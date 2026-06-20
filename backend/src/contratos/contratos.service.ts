import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateContratoDto } from './contratos.dto';
import { UpdateContratoDto } from './contratos.dto';

@Injectable()
export class ContratosService {
  constructor(private readonly dataSource: DataSource) {}

  async findAll() {
    return this.dataSource.query(
      `SELECT * FROM terminacion_contrato_view ORDER BY id DESC LIMIT 500`,
    );
  }

  async findTerminados() {
    return this.dataSource.query(
      `SELECT * FROM terminacion_contrato_view WHERE tipo IN ('Terminacion', 'Disminución') ORDER BY id DESC`,
    );
  }

  async create(data: CreateContratoDto & { usuario?: number }) {
    const result = await this.dataSource.query(
      `INSERT INTO terminacion_contrato
         (fecha, id_cliente, personas, fecha_inicio, fecha_terminacion, tipo, perfil, observacion, usuario)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id`,
      [
        data.fecha ?? null,
        data.id_cliente,
        data.personas ?? null,
        data.fecha_inicio ?? null,
        data.fecha_terminacion ?? null,
        data.tipo ?? null,
        data.perfil ?? null,
        data.observacion ?? null,
        data.usuario ?? null,
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
      'tipo', 'perfil', 'observacion',
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
