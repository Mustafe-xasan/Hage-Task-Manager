import { Request, Response, NextFunction } from "express"
import { AppError } from "../utility/AppError"
import { errorResponse } from "../utility/responseHelper"

export const errorMiddleware = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (err instanceof AppError) {
        return res
            .status(err.statusCode)
            .json(errorResponse(err.message))
    }

    // Postgres duplicate key error
    if (err.code === "23505") {
        return res
            .status(409)
            .json(errorResponse("Duplicate resource"));
    }

    console.error(err)

    return res
        .status(500)
        .json(errorResponse(err.message || "Internal Server Error"))
}