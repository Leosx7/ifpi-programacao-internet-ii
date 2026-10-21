import { NotFoundError } from "../errors/HttpError";
import {
  encountersRepository,
  type EncountersRepository,
} from "../repositories/encounters.repository";
import { getPatientById } from "./patients.service";
import type { CreateEncounterInput } from "../validation/encounters.schemas";

export async function listEncountersByPatient(
  patientId: number,
  repository: EncountersRepository = encountersRepository,
) {
  await getPatientById(patientId);
  return repository.findByPatientId(patientId);
}

export async function getEncounterById(
  id: number,
  repository: EncountersRepository = encountersRepository,
) {
  const encounter = await repository.findById(id);
  if (!encounter) {
    throw new NotFoundError("Atendimento não encontrado.");
  }
  return encounter;
}

export async function createEncounter(
  patientId: number,
  input: CreateEncounterInput,
  repository: EncountersRepository = encountersRepository,
) {
  await getPatientById(patientId);
  const id = await repository.create(patientId, input);
  return getEncounterById(id, repository);
}
