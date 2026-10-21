import { prisma } from "./prisma";

export type UserRecord = {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  role: string;
};

export type PublicUser = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "profissional" | "recepcao";
};

export interface UsersRepository {
  findByEmail(email: string): Promise<UserRecord | undefined>;
  findById(id: number): Promise<UserRecord | undefined>;
  create(input: {
    name: string;
    email: string;
    passwordHash: string;
    role: string;
  }): Promise<UserRecord>;
}

export class PrismaUsersRepository implements UsersRepository {
  async findByEmail(email: string) {
    return (await prisma.user.findUnique({ where: { email } })) ?? undefined;
  }

  async findById(id: number) {
    return (await prisma.user.findUnique({ where: { id } })) ?? undefined;
  }

  async create(input: {
    name: string;
    email: string;
    passwordHash: string;
    role: string;
  }) {
    return prisma.user.create({ data: input });
  }
}

export const usersRepository: UsersRepository = new PrismaUsersRepository();

export function toPublicUser(user: UserRecord): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as PublicUser["role"],
  };
}
