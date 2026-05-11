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
exports.Test = void 0;
const typeorm_1 = require("typeorm");
const question_entity_1 = require("./question.entity");
const test_result_entity_1 = require("./test-result.entity");
const test_enum_1 = require("../../common/enums/test.enum");
const direction_entity_1 = require("./direction.entity");
const group_entity_1 = require("./group.entity");
let Test = class Test {
    id;
    title;
    type;
    minScore;
    directionId;
    direction;
    groupId;
    group;
    createdAt;
    questions;
    results;
};
exports.Test = Test;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Test.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Test.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: test_enum_1.TestType }),
    __metadata("design:type", String)
], Test.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Test.prototype, "minScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Test.prototype, "directionId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => direction_entity_1.Direction, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'directionId' }),
    __metadata("design:type", direction_entity_1.Direction)
], Test.prototype, "direction", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Test.prototype, "groupId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => group_entity_1.Group, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'groupId' }),
    __metadata("design:type", group_entity_1.Group)
], Test.prototype, "group", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Test.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => question_entity_1.Question, (question) => question.test, { cascade: true }),
    __metadata("design:type", Array)
], Test.prototype, "questions", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => test_result_entity_1.TestResult, (result) => result.test),
    __metadata("design:type", Array)
], Test.prototype, "results", void 0);
exports.Test = Test = __decorate([
    (0, typeorm_1.Entity)()
], Test);
//# sourceMappingURL=test.entity.js.map