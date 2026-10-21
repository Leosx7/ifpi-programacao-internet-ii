import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";
import { BadRequestError } from "../errors/HttpError.ts";

export function validate(schema: ZodTypeAny) {
  return (request: Request, _response: Response, next: NextFunction) => {
    const result = schema.safeParse(request.body);

    if (!result.success) {
      throw new BadRequestError(
        "Dados de entrada invalidos.",
        result.error.flatten().fieldErrors
      );
    }

    request.body = result.data;
    next();
  };
}
