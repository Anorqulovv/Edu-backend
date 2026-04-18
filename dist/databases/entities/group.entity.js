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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Group = void 0;
const typeorm_1 = require("typeorm");
const student_entity_1 = require("./student.entity");
const user_entity_1 = require("./user.entity");
const Base_entity_1 = require("./Base.entity");
const groupStatus_enum_1 = require("../../common/enums/groupStatus.enum");
const direction_entity_1 = require("./direction.entity");
let Group = class Group extends Base_entity_1.BaseEntity {
    name;
    status;
    teacherId;
    teacher;
    directionId;
    direction;
    students;
};
exports.Group = Group;
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Group.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: groupStatus_enum_1.GroupStatus,
        default: groupStatus_enum_1.GroupStatus.ACTIVE
    }),
    __metadata("design:type", String)
], Group.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Group.prototype, "teacherId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'teacherId' }),
    __metadata("design:type", user_entity_1.User)
], Group.prototype, "teacher", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Group.prototype, "directionId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => direction_entity_1.Direction, (direction) => direction.groups, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'directionId' }),
    __metadata("design:type", direction_entity_1.Direction)
], Group.prototype, "direction", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => student_entity_1.Student, (student) => student.group),
    __metadata("design:type", Array)
], Group.prototype, "students", void 0);
exports.Group = Group = __decorate([
    (0, typeorm_1.Entity)('groups')
], Group);
//# sourceMappingURL=group.entity.js.map