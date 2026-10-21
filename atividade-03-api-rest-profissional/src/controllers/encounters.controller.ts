import type { Request, Response } from "express";
import { encountersService } from "../services/encounters.service.ts";

export const encountersController = {
  list(request: Request, response: Response) {
    response.status(200).json(encountersService.list(request.params.id));
  },

  create(request: Request, response: Response) {
    response.status(201).json(encountersService.create(request.params.id, request.body));
  },
};
