import { type z, ZodError } from "zod";
import { type NextFunction, type Request, type Response } from "express";
import { log } from "console";

export const validateBody = <T extends z.ZodSchema>(schema: T) => {
  return (
    req: ValidatedRequest<T>,
    res: Response,
    next: NextFunction
  ): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      // log(error);
      if (error instanceof ZodError) {
        const errorBody = new Map<string, string>();
        // log(errorBody);
        error.errors.forEach((err) => {
          const field = err.path.join(".");
          errorBody.set(field, err.message);
        });
        res.status(422).json({
          message: "Validation failed",
          errors: Object.fromEntries(errorBody),
          details: Array.from(errorBody.entries()).map(([field, message]) => ({
            field,
            message,
          })),
        });
        return;
      }
      next(error);
    }
  };
};
