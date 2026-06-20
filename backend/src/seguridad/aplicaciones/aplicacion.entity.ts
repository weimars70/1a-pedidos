import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('sec_aplicaciones')
export class Aplicacion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ nullable: true, type: 'text' })
  descripcion: string;

  @Column({ nullable: true })
  url: string;

  @Column({ nullable: true })
  icono: string;

  @Column({ default: true })
  activo: boolean;
}
