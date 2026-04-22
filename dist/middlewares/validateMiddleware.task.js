"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const AppError_1 = require("../utility/AppError");
const validate = (schema, source = 'body') => async (req, res, next) => {
    const result = await schema.safeParseAsync(req[source]);
    if (!result.success) {
        return next(new AppError_1.AppError(result.error.issues[0].message, 400));
    }
    req[source] = result.data;
    next();
};
exports.validate = validate;
//# sourceMappingURL=validateMiddleware.task.js.map