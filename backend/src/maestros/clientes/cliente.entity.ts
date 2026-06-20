import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('clientes')
export class Cliente {
  @PrimaryGeneratedColumn({ name: 'codigo' })
  id: number;

  @Column({ nullable: true })
  ident: string;

  @Column({ nullable: true })
  nombre: string;

  @Column({ name: 'ciudad_codigo', nullable: true })
  ciudad_codigo: string;

  @Column({ nullable: true })
  direccion: string;

  @Column({ nullable: true })
  telefono: string;

  @Column({ nullable: true })
  correo: string;

  @Column({ nullable: true })
  contacto: string;

  @Column({ name: 'centro_costos', nullable: true })
  centro_costos: string;

  @Column({ name: 'tope_credito', nullable: true, type: 'numeric' })
  tope_credito: number;

  @Column({ name: 'cod_supervisor', nullable: true })
  cod_supervisor: number;

  @Column({ name: 'codigo_sector', nullable: true })
  codigo_sector: number;

  @Column({ nullable: true, type: 'text' })
  observaciones: string;

  @Column({ nullable: true })
  activo: boolean;
}
