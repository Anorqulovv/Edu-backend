import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './Base.entity';
import { TestResult } from './test-result.entity';
import { TestType } from 'src/common/enums/test.enum';

@Entity('tests')
export class Test extends BaseEntity {
  @Column()
  title: string;

  @Column({
    type: 'enum',
    enum: TestType,
    default: TestType.DAILY,
  })
  type: TestType;

  @Column({ type: 'float', default: 60 })
  minScore: number;

  @OneToMany(() => TestResult, (result) => result.test, { cascade: true })
  results: TestResult[];
}