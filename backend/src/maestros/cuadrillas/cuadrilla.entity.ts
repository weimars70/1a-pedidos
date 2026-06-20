import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('cuadrillas_especiales')
export class Cuadrilla {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  nombre: string;

  @Column({ nullable: true })
  usuario: number;
}
