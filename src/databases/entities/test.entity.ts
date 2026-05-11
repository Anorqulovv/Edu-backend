// test.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Question } from './question.entity';
import { TestResult } from './test-result.entity';
import { TestType } from 'src/common/enums/test.enum';
import { Direction } from './direction.entity';
import { Group } from './group.entity';

@Entity()
export class Test {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'enum', enum: TestType })
  type: TestType;

  @Column({ nullable: true })
  minScore?: number;

  @Column({ nullable: true })
  directionId?: number;

  @ManyToOne(() => Direction, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'directionId' })
  direction: Direction;

  @Column({ nullable: true })
  groupId?: number;

  @ManyToOne(() => Group, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'groupId' })
  group: Group;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Question, (question) => question.test, { cascade: true })
  questions: Question[];

  @OneToMany(() => TestResult, (result) => result.test)
  results: TestResult[];
}
