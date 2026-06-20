import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('equipos')
export class Maquinaria {
  @PrimaryGeneratedColumn({ name: 'codigo' })
  id: number;

  @Column({ nullable: true })
  nombre: string;

  @Column({ nullable: true })
  grupo: number;

  @Column({ nullable: true })
  estado: boolean;

  @Column({ name: 'fecha_compra', nullable: true, type: 'date' })
  fecha_compra: string;

  @Column({ name: 'fecha_de_baja', nullable: true, type: 'date' })
  fecha_de_baja: string;

  @Column({ nullable: true })
  usuario: number;
}
