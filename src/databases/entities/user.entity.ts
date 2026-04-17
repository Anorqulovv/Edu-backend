import { Entity, Column, PrimaryGeneratedColumn, OneToMany, OneToOne, JoinColumn} from 'typeorm';
import { UserRole } from '../../common/enums/role.enum'
import { BaseEntity } from './Base.entity';


@Entity('users')
export class User extends BaseEntity{
  @Column({ unique: true })
  phone: string;

  @Column({ type: "varchar",unique: true })
  username: string;

  @Column({type: 'varchar'})
  password: string;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @Column({ nullable: true })
  telegramId: string;

  @Column()
  fullName: string;
}
