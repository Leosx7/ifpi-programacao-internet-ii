import type { Request, Response } from "express";
import { UnprocessableEntityError } from "../errors/HttpError";
import * as patientsService from "../services/patients.service";

export async function list(_request: Request, response: Response) {
  response.status(200).json(await patientsService.listPatients());
}

export async function getById(request: Request, response: Response) {
  const patient = await patientsService.getPatientById(Number(request.params.id));
  response.status(200).json(patient);
}

export async function create(request: Request, response: Response) {
  const created = await patientsService.createPatient(request.body);
  response.status(201).json(created);
}

export async function uploadPhoto(request: Request, response: Response) {
  if (!request.file) {
    throw new UnprocessableEntityError("Envie o arquivo no campo 'photo'.");
  }

  const updated = await patientsService.setPatientPhoto(
    Number(request.params.id),
    `/uploads/${request.file.filename}`,
  );
  response.status(200).json(updated);
}
