import type { Request, Response } from "express";
import { UnprocessableEntityError } from "../errors/HttpError.ts";
import { patientsService } from "../services/patients.service.ts";

export const patientsController = {
  list(_request: Request, response: Response) {
    response.status(200).json(patientsService.list());
  },

  getById(request: Request, response: Response) {
    response.status(200).json(patientsService.getById(request.params.id));
  },

  create(request: Request, response: Response) {
    response.status(201).json(patientsService.create(request.body));
  },

  uploadPhoto(request: Request, response: Response) {
    if (!request.file) {
      throw new UnprocessableEntityError("Envie uma foto no campo 'photo'.");
    }

    response.status(200).json(
      patientsService.updatePhoto(request.params.id, request.file.filename)
    );
  },
};
