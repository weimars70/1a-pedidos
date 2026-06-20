import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('tipo_servicio')
export class TipoServicio {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  nombre: string;

  @Column({ nullable: true })
  usuario: number;
}
