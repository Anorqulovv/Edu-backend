"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTestDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_test_dto_1 = require("./create-test.dto");
class UpdateTestDto extends (0, swagger_1.PartialType)(create_test_dto_1.CreateTestDto) {
}
exports.UpdateTestDto = UpdateTestDto;
//# sourceMappingURL=update-test.dto.js.map