import * as argon2 from "argon2";
import jwt, { type SignOptions } from "jsonwebtoken";
import {
  ConflictError,
  UnauthorizedError,
} from "../errors/HttpError";
import {
  usersRepository,
  toPublicUser,
  type UsersRepository,
} from "../repositories/users.repository";
import type {
  LoginInput,
  RegisterInput,
} from "../validation/auth.schemas";

function secret() {
  const value = process.env.JWT_SECRET;
  if (!value) {
    throw new Error("JWT_SECRET não configurado.");
  }
  return value;
}

function signToken(user: {
  id: number;
  name: string;
  role: "admin" | "profissional" | "recepcao";
}) {
  const expiresIn = (process.env.JWT_EXPIRES_IN ?? "15m") as SignOptions["expiresIn"];
  return jwt.sign(
    { id: user.id, name: user.name, role: user.role },
    secret(),
    { expiresIn },
  );
}

export async function register(
  input: RegisterInput,
  repository: UsersRepository = usersRepository,
) {
  const email = input.email.trim().toLowerCase();

  if (await repository.findByEmail(email)) {
    throw new ConflictError("Já existe um usuário com este e-mail.");
  }

  const passwordHash = await argon2.hash(input.password);

  try {
    const created = await repository.create({
      name: input.name.trim(),
      email,
      passwordHash,
      role: input.role,
    });
    return toPublicUser(created);
  } catch (error) {
    if (error instanceof Error && /unique|email/i.test(error.message)) {
      throw new ConflictError("Já existe um usuário com este e-mail.");
    }
    throw error;
  }
}

export async function login(
  input: LoginInput,
  repository: UsersRepository = usersRepository,
) {
  const user = await repository.findByEmail(input.email.trim().toLowerCase());
  const valid = user ? await argon2.verify(user.passwordHash, input.password) : false;

  if (!user || !valid) {
    throw new UnauthorizedError("Credenciais inválidas.");
  }

  const publicUser = toPublicUser(user);
  return {
    token: signToken(publicUser),
    user: publicUser,
  };
}
