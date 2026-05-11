import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { UserRole } from '../../common/enums/role.enum';
import { BaseEntity } from './Base.entity';
import { Direction } from './direction.entity';
import { Branch } from './branch.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true })
  phone: string;

  @Column({ type: 'varchar', unique: true })
  username: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @Column({ nullable: true })
  telegramId: string;

  @Column()
  fullName: string;

  // Bitta asosiy yo'nalish (orqaga muvofiqligi uchun saqlanadi)
  @ManyToOne(() => Direction, { nullable: true, eager: true })
  @JoinColumn({ name: 'directionId' })
  direction: Direction;

  @Column({ nullable: true })
  directionId: number;

  // Ko'p yo'nalishlar (o'qituvchi va support uchun)
  @Column({ type: 'simple-array', nullable: true })
  directionIds: number[];

  @ManyToOne(() => Branch, { nullable: true, eager: true })
  @JoinColumn({ name: 'branchId' })
  branch: Branch;

  @Column({ nullable: true })
  branchId: number;

  @Column({ nullable: true, type: 'text' })
  avatar: string;
}
