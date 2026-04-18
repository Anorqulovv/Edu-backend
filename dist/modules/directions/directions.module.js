"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DirectionModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const direction_entity_1 = require("../../databases/entities/direction.entity");
const directions_controller_1 = require("./directions.controller");
const directions_service_1 = require("./directions.service");
let DirectionModule = class DirectionModule {
};
exports.DirectionModule = DirectionModule;
exports.DirectionModule = DirectionModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([direction_entity_1.Direction])],
        controllers: [directions_controller_1.DirectionController],
        providers: [directions_service_1.DirectionService],
        exports: [directions_service_1.DirectionService],
    })
], DirectionModule);
//# sourceMappingURL=directions.module.js.map