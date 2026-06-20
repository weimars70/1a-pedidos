import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Implemento } from './implemento.entity';

@Injectable()
export class ImplementosService {
  constructor(@InjectRepository(Implemento) private readonly repo: Repository<Implemento>) {}
  findAll() { return this.repo.find({ order: { nombre: 'ASC' } }); }
  async findOne(id: number) {
    const r = await this.repo.findOne({ where: { id } });
    if (!r) throw new NotFoundException();
    return r;
  }
  create(data: Partial<Implemento>) {
    const { id: _id, ...rest } = data as Record<string, unknown>;
    return this.repo.save(this.repo.create(rest as Partial<Implemento>));
  }
  async update(id: number, data: Partial<Implemento>) { await this.repo.update(id, data); return this.findOne(id); }
  async remove(id: number) { await this.findOne(id); await this.repo.delete(id); }
}
