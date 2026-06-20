import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('implementos')
export class Implemento {
  @PrimaryGeneratedColumn({ name: 'codigo' })
  id: number;

  @Column({ nullable: true })
  nombre: string;

  @Column({ nullable: true })
  observacion: string;

  @Column({ nullable: true })
  usuario: number;
}
