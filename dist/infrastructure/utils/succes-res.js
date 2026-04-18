"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.succesRes = void 0;
const succesRes = (data, statusCode = 200) => {
    return {
        statusCode,
        message: 'succes',
        data,
    };
};
exports.succesRes = succesRes;
//# sourceMappingURL=succes-res.js.map