import type { ErrorRequestHandler, Response } from "express";
import multer from "multer";
import { HttpError, PayloadTooLargeError } from "../errors/HttpError.ts";

function sendHttpError(response: Response, error: HttpError) {
  response.status(error.statusCode).json({
    error: {
      message: error.message,
      statusCode: error.statusCode,
      details: error.details ?? null,
    },
  });
}

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
    sendHttpError(response, new PayloadTooLargeError("A foto deve ter no maximo 2MB."));
    return;
  }

  if (error instanceof HttpError) {
    sendHttpError(response, error);
    return;
  }

  console.error(error);
  response.status(500).json({
    error: {
      message: "Erro interno do servidor.",
      statusCode: 500,
      details: null,
    },
  });
};
