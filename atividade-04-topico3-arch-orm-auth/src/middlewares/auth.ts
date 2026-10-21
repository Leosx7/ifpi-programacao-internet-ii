import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import {
  ForbiddenError,
  UnauthorizedError,
} from "../errors/HttpError";

export type AuthenticatedUser = {
  id: number;
  name: string;
  role: "admin" | "profissional" | "recepcao";
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

function secret() {
  const value = process.env.JWT_SECRET;
  if (!value) {
    throw new Error("JWT_SECRET não configurado.");
  }
  return value;
}

function isRole(value: unknown): value is AuthenticatedUser["role"] {
  return value === "admin" || value === "profissional" || value === "recepcao";
}

export function requireAuth(
  request: Request,
  _response: Response,
  next: NextFunction,
) {
  const header = request.headers.authorization;
  const [scheme, token, extra] = header?.split(" ") ?? [];

  if (scheme !== "Bearer" || !token || extra) {
    throw new UnauthorizedError();
  }

  try {
    const decoded = jwt.verify(token, secret());

    if (
      typeof decoded === "string" ||
      typeof decoded.id !== "number" ||
      typeof decoded.name !== "string" ||
      !isRole(decoded.role)
    ) {
      throw new UnauthorizedError();
    }

    request.user = {
      id: decoded.id,
      name: decoded.name,
      role: decoded.role,
    };
    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw error;
    }
    throw new UnauthorizedError("Token inválido ou expirado.");
  }
}

export function requireRoles(
  ...roles: AuthenticatedUser["role"][]
) {
  return (
    request: Request,
    _response: Response,
    next: NextFunction,
  ) => {
    if (!request.user) {
      throw new UnauthorizedError();
    }
    if (!roles.includes(request.user.role)) {
      throw new ForbiddenError();
    }
    next();
  };
}
