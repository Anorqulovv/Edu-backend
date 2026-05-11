"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../../databases/entities/user.entity");
const student_entity_1 = require("../../databases/entities/student.entity");
const group_entity_1 = require("../../databases/entities/group.entity");
const test_entity_1 = require("../../databases/entities/test.entity");
const role_enum_1 = require("../../common/enums/role.enum");
const groupStatus_enum_1 = require("../../common/enums/groupStatus.enum");
const succes_res_1 = require("../../infrastructure/utils/succes-res");
let DashboardService = class DashboardService {
    userRepo;
    studentRepo;
    groupRepo;
    testRepo;
    constructor(userRepo, studentRepo, groupRepo, testRepo) {
        this.userRepo = userRepo;
        this.studentRepo = studentRepo;
        this.groupRepo = groupRepo;
        this.testRepo = testRepo;
    }
    async getStats() {
        const [totalStudents, totalGroups, activeGroups, totalTeachers, totalAdmins, totalSupports, totalParents, totalTests,] = await Promise.all([
            this.studentRepo.count(),
            this.groupRepo.count(),
            this.groupRepo.count({ where: { status: groupStatus_enum_1.GroupStatus.ACTIVE } }),
            this.userRepo.count({ where: { role: role_enum_1.UserRole.TEACHER } }),
            this.userRepo.count({ where: { role: role_enum_1.UserRole.ADMIN } }),
            this.userRepo.count({ where: { role: role_enum_1.UserRole.SUPPORT } }),
            this.userRepo.count({ where: { role: role_enum_1.UserRole.PARENT } }),
            this.testRepo.count(),
        ]);
        return (0, succes_res_1.succesRes)({
            totalStudents,
            totalGroups,
            activeGroups,
            totalTeachers,
            totalAdmins,
            totalSupports,
            totalParents,
            totalTests,
        });
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(student_entity_1.Student)),
    __param(2, (0, typeorm_1.InjectRepository)(group_entity_1.Group)),
    __param(3, (0, typeorm_1.InjectRepository)(test_entity_1.Test)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map