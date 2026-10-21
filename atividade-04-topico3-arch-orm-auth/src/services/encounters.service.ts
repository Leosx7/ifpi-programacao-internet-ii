import { NotFoundError } from "../errors/HttpError";
import {
  encountersRepository,
  type EncountersRepository,
  type EncounterRecord,
} from "../repositories/encounters.repository";
import { getPatientById } from "./patients.service";
import type { CreateEncounterInput } from "../validation/encounters.schemas";

type Actor = {
  id: number;
  role: "admin" | "profissional" | "recepcao";
};

function toJson(record: EncounterRecord) {
  const { professionalId: _professionalId, ...json } = record;
  return json;
}

export async function listEncountersByPatient(
  patientId: number,
  repository: EncountersRepository = encountersRepository,
) {
  await getPatientById(patientId);
  return repository.findByPatientId(patientId);
}

export async function getEncounterRecord(
  id: number,
  repository: EncountersRepository = encountersRepository,
) {
  const encounter = await repository.findById(id);
  if (!encounter) {
    throw new NotFoundError("Atendimento não encontrado.");
  }
  return encounter;
}

export async function getEncounterById(
  id: number,
  repository: EncountersRepository = encountersRepository,
) {
  return toJson(await getEncounterRecord(id, repository));
}

export async function createEncounter(
  patientId: number,
  input: CreateEncounterInput,
  actor: Actor,
  repository: EncountersRepository = encountersRepository,
) {
  await getPatientById(patientId);
  const professionalId = actor.role === "profissional" ? actor.id : null;
  const id = await repository.create(patientId, input, professionalId);
  return getEncounterById(id, repository);
}
