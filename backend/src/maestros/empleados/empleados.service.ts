import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Empleado } from './empleado.entity';

@Injectable()
export class EmpleadosService {
  constructor(
    @InjectRepository(Empleado) private readonly repo: Repository<Empleado>,
    private readonly db: DataSource,
  ) {}
  // Listado: usa la vista view_empleados (incluye ciudad, profesión y perfil resueltos)
  findAll() {
    return this.db.query(
      `SELECT codigo AS id, ident, nombre, direccion,
              ciudad_codigo, ciudad_nombre, telefono, movil, email,
              profesion_codigo, profesion_nombre, id_perfil, perfil,
              activo, personal_interno
       FROM public.view_empleados
       ORDER BY nombre ASC`,
    );
  }
  async findOne(id: number) {
    const r = await this.repo.findOne({ where: { id } });
    if (!r) throw new NotFoundException();
    return r;
  }
  create(data: Partial<Empleado>) {
    const { id: _id, ...rest } = data as Record<string, unknown>;
    return this.repo.save(this.repo.create(rest as Partial<Empleado>));
  }
  async update(id: number, data: Partial<Empleado>) { await this.repo.update(id, data); return this.findOne(id); }
  async remove(id: number) { await this.findOne(id); await this.repo.update(id, { activo: false } as Partial<Empleado>); }
}
