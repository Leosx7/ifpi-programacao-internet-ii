import {
  medicationsRepository,
  type MedicationsRepository,
} from "../repositories/medications.repository";
import { getEncounterById } from "./encounters.service";
import type { CreateMedicationInput } from "../validation/medications.schemas";

export async function listMedicationsByEncounter(
  encounterId: number,
  repository: MedicationsRepository = medicationsRepository,
) {
  await getEncounterById(encounterId);
  return repository.findByEncounterId(encounterId);
}

export async function createMedication(
  encounterId: number,
  input: CreateMedicationInput,
  repository: MedicationsRepository = medicationsRepository,
) {
  await getEncounterById(encounterId);
  return repository.create(encounterId, input);
}
