import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('soporte')
export class Soporte {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ name: 'fecha_hora' })
  fechaHora: Date;

  @Column({ nullable: true, type: 'text' })
  novedad: string;

  @Column({ nullable: true, default: 'Abierto' })
  estado: string;
}
