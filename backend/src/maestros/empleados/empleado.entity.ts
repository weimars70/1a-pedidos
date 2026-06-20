import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('empleados')
export class Empleado {
  @PrimaryGeneratedColumn({ name: 'codigo' })
  id: number;

  @Column({ nullable: true })
  tipoident: string;

  @Column({ nullable: true })
  ident: string;

  @Column({ nullable: true })
  nombre: string;

  @Column({ nullable: true })
  direccion: string;

  @Column({ nullable: true })
  telefono: string;

  @Column({ nullable: true })
  movil: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  activo: boolean;

  @Column({ name: 'personal_interno', nullable: true })
  personal_interno: boolean;

  @Column({ nullable: true })
  sexo: number;

  @Column({ nullable: true })
  perfil: number;
}
