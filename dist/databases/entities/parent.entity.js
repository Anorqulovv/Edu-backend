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
exports.Parent = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const student_entity_1 = require("./student.entity");
const Base_entity_1 = require("./Base.entity");
let Parent = class Parent extends Base_entity_1.BaseEntity {
    userId;
    user;
    students;
};
exports.Parent = Parent;
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Parent.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], Parent.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => student_entity_1.Student, (student) => student.parent),
    __metadata("design:type", Array)
], Parent.prototype, "students", void 0);
exports.Parent = Parent = __decorate([
    (0, typeorm_1.Entity)('parents')
], Parent);
//# sourceMappingURL=parent.entity.js.map