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
const Base_entity_1 = require("./Base.entity");
const test_result_entity_1 = require("./test-result.entity");
const test_enum_1 = require("../../common/enums/test.enum");
let Test = class Test extends Base_entity_1.BaseEntity {
    title;
    type;
    minScore;
    results;
};
exports.Test = Test;
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Test.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: test_enum_1.TestType,
        default: test_enum_1.TestType.DAILY,
    }),
    __metadata("design:type", String)
], Test.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', default: 60 }),
    __metadata("design:type", Number)
], Test.prototype, "minScore", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => test_result_entity_1.TestResult, (result) => result.test, { cascade: true }),
    __metadata("design:type", Array)
], Test.prototype, "results", void 0);
exports.Test = Test = __decorate([
    (0, typeorm_1.Entity)('tests')
], Test);
//# sourceMappingURL=test.entity.js.map