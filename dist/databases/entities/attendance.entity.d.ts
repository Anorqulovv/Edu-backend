import { Student } from './student.entity';
import { BaseEntity } from './Base.entity';
export declare class Attendance extends BaseEntity {
    studentId: number;
    student: Student;
    isPresent: boolean;
    type: string;
    timestamp: Date;
}
