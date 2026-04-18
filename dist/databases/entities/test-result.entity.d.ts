import { Test } from './test.entity';
import { Student } from '../entities/student.entity';
import { BaseEntity } from './Base.entity';
export declare class TestResult extends BaseEntity {
    score: number;
    testId: number;
    test: Test;
    studentId: number;
    student: Student;
}
