import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Soporte } from './soporte.entity';
import { SoporteSeguimiento } from './soporte-seguimiento.entity';
import { CreateSoporteDto } from './dto/create-soporte.dto';
import { CreateSeguimientoDto } from './dto/create-seguimiento.dto';

@Injectable()
export class SoporteService {
  constructor(
    @InjectRepository(Soporte)
    private readonly repo: Repository<Soporte>,
    @InjectRepository(SoporteSeguimiento)
    private readonly seguimientoRepo: Repository<SoporteSeguimiento>,
  ) {}

  findAll() {
    return this.repo.find({ order: { fechaHora: 'DESC' } });
  }

  findOne(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  create(data: CreateSoporteDto) {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: number, data: Partial<CreateSoporteDto>) {
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.repo.delete(id);
  }

  findSeguimientos(soporteId: number) {
    return this.seguimientoRepo.find({
      where: { soporteId },
      order: { fecha: 'ASC' },
    });
  }

  createSeguimiento(soporteId: number, data: CreateSeguimientoDto) {
    return this.seguimientoRepo.save(
      this.seguimientoRepo.create({ soporteId, ...data }),
    );
  }
}
