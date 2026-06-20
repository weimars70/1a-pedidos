import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('sec_grupos')
export class Grupo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ nullable: true, type: 'text' })
  descripcion: string;
}
