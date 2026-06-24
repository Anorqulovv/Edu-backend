import { 
  Entity, 
  Column, 
  OneToOne, 
  ManyToOne, 
  OneToMany, 
  JoinColumn 
} from 'typeorm';
import { User } from './user.entity';
import { Parent } from './parent.entity';
import { Group } from '../entities/group.entity'; 
import { Attendance } from './attendance.entity';
import { TestResult } from '../entities/test-result.entity';
import { BaseEntity } from './Base.entity';

@Entity('students')
export class Student extends BaseEntity {

  @Column({ unique: true, nullable: true })
  cardId: string;

  @Column()
  userId: number;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  parentId?: number;

  @ManyToOne(() => Parent, (parent) => parent.students, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'parentId' })
  parent: Parent;

  @Column({ nullable: true })
  groupId?: number;

  @ManyToOne(() => Group, (group) => group.students, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'groupId' })
  group: Group;

  @OneToMany(() => Attendance, (attendance) => attendance.student)
  attendance: Attendance[];

  @OneToMany(() => TestResult, (result) => result.student)
  results: TestResult[];
}