import { Router } from "express";
import * as medicationsController from "../controllers/medications.controller";
import { requireAuth, requireRoles } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { createMedicationSchema } from "../validation/medications.schemas";

export const medicationsRouter = Router({ mergeParams: true });

medicationsRouter.use(requireAuth);
medicationsRouter.get(
  "/",
  requireRoles("admin", "profissional"),
  medicationsController.listByEncounter,
);
medicationsRouter.post(
  "/",
  requireRoles("profissional"),
  validate(createMedicationSchema),
  medicationsController.create,
);
