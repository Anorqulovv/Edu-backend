import { Repository } from 'typeorm';
import { User } from "../../databases/entities/user.entity";
import { Student } from "../../databases/entities/student.entity";
import { Group } from "../../databases/entities/group.entity";
import { Test } from "../../databases/entities/test.entity";
import { ISucces } from "../../infrastructure/utils/succes-interface";
export declare class DashboardService {
    private readonly userRepo;
    private readonly studentRepo;
    private readonly groupRepo;
    private readonly testRepo;
    constructor(userRepo: Repository<User>, studentRepo: Repository<Student>, groupRepo: Repository<Group>, testRepo: Repository<Test>);
    getStats(): Promise<ISucces>;
}
