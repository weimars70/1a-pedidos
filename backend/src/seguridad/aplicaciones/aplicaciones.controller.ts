import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AplicacionesService } from './aplicaciones.service';
import { CreateAplicacionDto } from './dto/create-aplicacion.dto';
import { UpdateAplicacionDto } from './dto/update-aplicacion.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('seguridad/aplicaciones')
@UseGuards(JwtAuthGuard)
export class AplicacionesController {
  constructor(private readonly svc: AplicacionesService) {}

  @Get()
  findAll() {
    return this.svc.findAll();
  }

  @Post()
  create(@Body() body: CreateAplicacionDto) {
    return this.svc.create(body);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateAplicacionDto) {
    return this.svc.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }
}
