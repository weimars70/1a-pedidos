import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cuadrilla } from './cuadrilla.entity';

@Injectable()
export class CuadrillasService {
  constructor(@InjectRepository(Cuadrilla) private readonly repo: Repository<Cuadrilla>) {}
  findAll() { return this.repo.find({ order: { id: 'ASC' } }); }
  async findOne(id: number) {
    const r = await this.repo.findOne({ where: { id } });
    if (!r) throw new NotFoundException();
    return r;
  }
  create(data: Partial<Cuadrilla>) {
    const { id: _id, ...rest } = data as Record<string, unknown>;
    return this.repo.save(this.repo.create(rest as Partial<Cuadrilla>));
  }
  async update(id: number, data: Partial<Cuadrilla>) { await this.repo.update(id, data); return this.findOne(id); }
  async remove(id: number) { await this.findOne(id); await this.repo.delete(id); }
}
