import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Aplicacion } from './aplicacion.entity';
import { CreateAplicacionDto } from './dto/create-aplicacion.dto';
import { UpdateAplicacionDto } from './dto/update-aplicacion.dto';

@Injectable()
export class AplicacionesService {
  constructor(
    @InjectRepository(Aplicacion)
    private readonly repo: Repository<Aplicacion>,
  ) {}

  findAll() {
    return this.repo.find({ order: { nombre: 'ASC' } });
  }

  findOne(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  create(data: CreateAplicacionDto) {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: number, data: UpdateAplicacionDto) {
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.repo.delete(id);
  }
}
