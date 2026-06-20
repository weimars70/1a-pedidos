import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('perfiles')
export class Perfil {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  nombre: string;

  @Column({ nullable: true })
  usuario: number;
}
