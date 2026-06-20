import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Causal } from './causal.entity';

@Injectable()
export class CausalesService {
  constructor(
    @InjectRepository(Causal)
    private readonly repo: Repository<Causal>,
  ) {}

  findAll(): Promise<Causal[]> {
    return this.repo.find({ order: { id: 'ASC' } });
  }

  async findOne(id: number): Promise<Causal> {
    const record = await this.repo.findOne({ where: { id } });
    if (!record) throw new NotFoundException(`Registro ${id} no encontrado`);
    return record;
  }

  create(data: Partial<Causal>): Promise<Causal> {
    const { id: _id, ...rest } = data as Record<string, unknown>;
    return this.repo.save(this.repo.create(rest as Partial<Causal>));
  }

  async update(id: number, data: Partial<Causal>): Promise<Causal> {
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.repo.delete(id);
  }
}
