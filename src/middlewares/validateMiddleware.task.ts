
import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { AppError } from "../utility/AppError";

export const validate =
  (schema: ZodSchema, source: 'body' | 'params' | 'query' = 'body') =>
    async (req: Request, res: Response, next: NextFunction) => {
      const result = await schema.safeParseAsync(req[source]);

      if (!result.success) {
        return next(new AppError(result.error.issues[0].message, 400));
      }
      req[source] = result.data;
      next();
    };