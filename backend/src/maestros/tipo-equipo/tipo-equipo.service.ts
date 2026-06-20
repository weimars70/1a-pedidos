import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TipoEquipo } from './tipo-equipo.entity';

@Injectable()
export class TipoEquipoService {
  constructor(@InjectRepository(TipoEquipo) private readonly repo: Repository<TipoEquipo>) {}
  findAll() { return this.repo.find({ order: { nombre: 'ASC' } }); }
  async findOne(id: number) {
    const r = await this.repo.findOne({ where: { id } });
    if (!r) throw new NotFoundException();
    return r;
  }
  create(data: Partial<TipoEquipo>) {
    const { id: _id, ...rest } = data as Record<string, unknown>;
    return this.repo.save(this.repo.create(rest as Partial<TipoEquipo>));
  }
  async update(id: number, data: Partial<TipoEquipo>) { await this.repo.update(id, data); return this.findOne(id); }
  async remove(id: number) { await this.findOne(id); await this.repo.delete(id); }
}
