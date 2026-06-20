import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('tipo_equipo')
export class TipoEquipo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  nombre: string;

  @Column({ nullable: true })
  usuario: number;
}
