import { ForbiddenError } from "../errors/HttpError";
import {
  medicationsRepository,
  type MedicationsRepository,
} from "../repositories/medications.repository";
import { getEncounterRecord } from "./encounters.service";
import type { CreateMedicationInput } from "../validation/medications.schemas";

type Actor = {
  id: number;
  role: "admin" | "profissional" | "recepcao";
};

export async function listMedicationsByEncounter(
  encounterId: number,
  repository: MedicationsRepository = medicationsRepository,
) {
  await getEncounterRecord(encounterId);
  return repository.findByEncounterId(encounterId);
}

export async function createMedication(
  encounterId: number,
  input: CreateMedicationInput,
  actor: Actor,
  repository: MedicationsRepository = medicationsRepository,
) {
  const encounter = await getEncounterRecord(encounterId);

  if (
    actor.role !== "profissional" ||
    encounter.professionalId !== actor.id
  ) {
    throw new ForbiddenError(
      "Somente o profissional que registrou o atendimento pode prescrever nele.",
    );
  }

  return repository.create(encounterId, input);
}
