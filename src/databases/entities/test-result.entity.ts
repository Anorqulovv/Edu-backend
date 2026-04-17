import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Test } from './test.entity';
import { Student } from '../entities/student.entity'; 
import { BaseEntity } from './Base.entity';

@Entity('test_results')
export class TestResult extends BaseEntity {

  @Column({ type: 'float' })
  score: number; 

  @Column()
  testId: number;

  @ManyToOne(() => Test, (test) => test.results, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'testId' })
  test: Test;

  @Column()
  studentId: number;

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentId' })
  student: Student;
}