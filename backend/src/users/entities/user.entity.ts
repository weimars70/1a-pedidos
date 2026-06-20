import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('usuarios')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'email' })
  email: string;

  @Column({ name: 'password' })
  pswd: string;

  @Column({ name: 'first_name', nullable: true })
  name?: string;

  @Column({ name: 'last_name', nullable: true })
  lastName?: string;

  @Column()
  usuario: number;
}
