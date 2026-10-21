import { ConflictError, NotFoundError } from "../errors/HttpError";
import {
  patientsRepository,
  type PatientsRepository,
} from "../repositories/patients.repository";
import type { CreatePatientInput } from "../validation/patients.schemas";

export async function listPatients(
  repository: PatientsRepository = patientsRepository,
) {
  return repository.findAll();
}

export async function getPatientById(
  id: number,
  repository: PatientsRepository = patientsRepository,
) {
  const patient = await repository.findById(id);
  if (!patient) {
    throw new NotFoundError("Paciente não encontrado.");
  }
  return patient;
}

export async function createPatient(
  input: CreatePatientInput,
  repository: PatientsRepository = patientsRepository,
) {
  const duplicate = await repository.findByNationalId(input.nationalId);
  if (duplicate) {
    throw new ConflictError("Já existe um paciente com este CNS.");
  }

  try {
    const id = await repository.create(input);
    return await getPatientById(id, repository);
  } catch (error) {
    if (
      error instanceof Error &&
      /unique|national_id|nationalId/i.test(error.message)
    ) {
      throw new ConflictError("Já existe um paciente com este CNS.");
    }
    throw error;
  }
}

export async function setPatientPhoto(
  id: number,
  photoUrl: string,
  repository: PatientsRepository = patientsRepository,
) {
  await getPatientById(id, repository);
  await repository.updatePhoto(id, photoUrl);
  return getPatientById(id, repository);
}
