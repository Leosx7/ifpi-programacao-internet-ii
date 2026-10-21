import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(1, "O campo 'name' é obrigatório."),
  email: z.email("Informe um e-mail válido."),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres."),
  role: z.enum(["admin", "profissional", "recepcao"]),
});

export const loginSchema = z.object({
  email: z.email("Informe um e-mail válido."),
  password: z.string({ error: "O campo 'password' é obrigatório." }),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
