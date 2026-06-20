import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Maquinaria } from './maquinaria.entity';

@Injectable()
export class MaquinariaService {
  constructor(@InjectRepository(Maquinaria) private readonly repo: Repository<Maquinaria>) {}
  findAll() { return this.repo.find({ order: { nombre: 'ASC' } }); }
  async findOne(id: number) {
    const r = await this.repo.findOne({ where: { id } });
    if (!r) throw new NotFoundException();
    return r;
  }
  create(data: Partial<Maquinaria>) {
    const { id: _id, ...rest } = data as Record<string, unknown>;
    return this.repo.save(this.repo.create(rest as Partial<Maquinaria>));
  }
  async update(id: number, data: Partial<Maquinaria>) {
    await this.repo.update(id, data);
    return this.findOne(id);
  }
  async remove(id: number) { await this.findOne(id); await this.repo.update(id, { estado: false } as Partial<Maquinaria>); }
}
