import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('soporte_seguimiento')
export class SoporteSeguimiento {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'soporte_id' })
  soporteId: number;

  @CreateDateColumn({ name: 'fecha' })
  fecha: Date;

  @Column({ nullable: true, type: 'text' })
  descripcion: string;

  @Column({ nullable: true })
  usuario: string;
}
