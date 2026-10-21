export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly details: unknown = null
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class BadRequestError extends HttpError {
  constructor(message = "Requisição inválida.", details: unknown = null) {
    super(400, message, details);
  }
}

export class NotFoundError extends HttpError {
  constructor(message = "Recurso não encontrado.", details: unknown = null) {
    super(404, message, details);
  }
}

export class ConflictError extends HttpError {
  constructor(message = "Conflito com o estado atual do recurso.", details: unknown = null) {
    super(409, message, details);
  }
}

export class UnprocessableEntityError extends HttpError {
  constructor(message = "Entidade não processável.", details: unknown = null) {
    super(422, message, details);
  }
}

export class PayloadTooLargeError extends HttpError {
  constructor(message = "Arquivo grande demais.", details: unknown = null) {
    super(413, message, details);
  }
}
