import { Router } from "express";
import * as encountersController from "../controllers/encounters.controller";
import { requireAuth, requireRoles } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { createEncounterSchema } from "../validation/encounters.schemas";

export const encountersRouter = Router({ mergeParams: true });

encountersRouter.use(requireAuth);
encountersRouter.get("/", encountersController.listByPatient);
encountersRouter.post(
  "/",
  requireRoles("admin", "profissional"),
  validate(createEncounterSchema),
  encountersController.create,
);
