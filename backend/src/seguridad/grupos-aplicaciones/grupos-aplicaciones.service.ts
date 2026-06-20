import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GrupoAplicacion } from './grupo-aplicacion.entity';
import { Aplicacion } from '../aplicaciones/aplicacion.entity';

@Injectable()
export class GruposAplicacionesService {
  constructor(
    @InjectRepository(GrupoAplicacion)
    private readonly repo: Repository<GrupoAplicacion>,
    @InjectRepository(Aplicacion)
    private readonly appsRepo: Repository<Aplicacion>,
  ) {}

  async getAplicacionesForGrupo(grupoId: number) {
    const todas = await this.appsRepo.find({ order: { nombre: 'ASC' } });
    const asignadas = await this.repo.find({ where: { grupoId } });
    const asignadasIds = new Set(asignadas.map((a) => a.aplicacionId));
    return todas.map((app) => ({ ...app, asignada: asignadasIds.has(app.id) }));
  }

  async assign(grupoId: number, aplicacionId: number) {
    const existing = await this.repo.findOne({ where: { grupoId, aplicacionId } });
    if (existing) return existing;
    return this.repo.save(this.repo.create({ grupoId, aplicacionId }));
  }

  async remove(id: number) {
    await this.repo.delete(id);
  }

  async removeByGrupoAndApp(grupoId: number, aplicacionId: number) {
    await this.repo.delete({ grupoId, aplicacionId });
  }
}
