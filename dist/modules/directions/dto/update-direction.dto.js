"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateDirectionDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_direction_dto_1 = require("./create-direction.dto");
class UpdateDirectionDto extends (0, swagger_1.PartialType)(create_direction_dto_1.CreateDirectionDto) {
}
exports.UpdateDirectionDto = UpdateDirectionDto;
//# sourceMappingURL=update-direction.dto.js.map