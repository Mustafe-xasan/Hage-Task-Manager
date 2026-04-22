"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = void 0;
const AppError_1 = require("../utility/AppError");
const responseHelper_1 = require("../utility/responseHelper");
const errorMiddleware = (err, req, res, next) => {
    if (err instanceof AppError_1.AppError) {
        return res
            .status(err.statusCode)
            .json((0, responseHelper_1.errorResponse)(err.message));
    }
    // Postgres duplicate key error
    if (err.code === "23505") {
        return res
            .status(409)
            .json((0, responseHelper_1.errorResponse)("Duplicate resource"));
    }
    console.error(err);
    return res
        .status(500)
        .json((0, responseHelper_1.errorResponse)(err.message || "Internal Server Error"));
};
exports.errorMiddleware = errorMiddleware;
//# sourceMappingURL=errorMiddleware.js.map