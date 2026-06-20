import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('sec_grupos_aplicaciones')
export class GrupoAplicacion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'grupo_id' })
  grupoId: number;

  @Column({ name: 'aplicacion_id' })
  aplicacionId: number;
}
