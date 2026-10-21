import { z } from "zod";

export const createPatientSchema = z.object({
  name: z.string().trim().min(1, "name é obrigatório."),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "birthDate deve estar no formato AAAA-MM-DD."),
  nationalId: z.string().trim().min(1, "nationalId é obrigatório."),
});
