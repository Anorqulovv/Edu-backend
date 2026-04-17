import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Student } from './student.entity';
import { User } from './user.entity';
import { BaseEntity } from './Base.entity';
import { GroupStatus } from 'src/common/enums/groupStatus.enum';
import { Direction } from './direction.entity';  

@Entity('groups')
export class Group extends BaseEntity {
  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: GroupStatus,
    default: GroupStatus.ACTIVE
  })
  status: GroupStatus;

  @Column()
  teacherId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'teacherId' })
  teacher: User;

  @Column({ nullable: true })
  directionId?: number;

  @ManyToOne(() => Direction, (direction) => direction.groups, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'directionId' })
  direction: Direction;

  @OneToMany(() => Student, (student) => student.group)
  students: Student[];
}