import { Injectable } from '@nestjs/common';

@Injectable()
export class EmpresasService {
  findAll() {
    return [
      { id: 1, nombre: 'Uno-A Aseo Integrado S.A.' },
    ];
  }
}
