export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly details: unknown = null,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class BadRequestError extends HttpError {
  constructor(message: string, details: unknown = null) {
    super(400, message, details);
  }
}
export class UnauthorizedError extends HttpError {
  constructor(message = "Autenticação necessária.") {
    super(401, message);
  }
}
export class ForbiddenError extends HttpError {
  constructor(message = "Você não tem permissão para esta operação.") {
    super(403, message);
  }
}
export class NotFoundError extends HttpError {
  constructor(message: string) {
    super(404, message);
  }
}
export class ConflictError extends HttpError {
  constructor(message: string) {
    super(409, message);
  }
}
export class UnprocessableEntityError extends HttpError {
  constructor(message: string, details: unknown = null) {
    super(422, message, details);
  }
}
export class PayloadTooLargeError extends HttpError {
  constructor(message: string) {
    super(413, message);
  }
}
