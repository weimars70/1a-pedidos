import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHash } from 'crypto';
import { User } from '../../users/entities/user.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  findAll() {
    return this.repo.find({
      select: ['email', 'name'],
      order: { name: 'ASC' },
    });
  }

  findOne(email: string) {
    return this.repo.findOne({
      where: { email },
      select: ['email', 'name'],
    });
  }

  create(data: CreateUsuarioDto) {
    const user = this.repo.create({
      email: data.login,
      name: data.name,
      pswd: data.pswd ? createHash('md5').update(data.pswd).digest('hex') : undefined,
    });
    return this.repo.save(user);
  }

  async update(email: string, data: UpdateUsuarioDto) {
    const update: Partial<User> = {
      name: data.name,
    };
    if (data.pswd) {
      update.pswd = createHash('md5').update(data.pswd).digest('hex');
    }
    await this.repo.update({ email }, update);
    return this.findOne(email);
  }

  async remove(email: string) {
    await this.repo.delete({ email });
  }
}
