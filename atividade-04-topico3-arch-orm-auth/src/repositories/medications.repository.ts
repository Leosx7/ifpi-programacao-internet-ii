import { db } from "../database";
import { prisma } from "./prisma";
import type { CreateMedicationInput } from "../validation/medications.schemas";

export type MedicationJson = {
  id: number;
  encounterId: number;
  medication: string;
  dosage: string;
};

type MedicationRow = {
  id: number;
  encounter_id: number;
  medication: string;
  dosage: string;
};

export interface MedicationsRepository {
  findByEncounterId(encounterId: number): Promise<MedicationJson[]>;
  create(encounterId: number, input: CreateMedicationInput): Promise<MedicationJson>;
}

function sqliteToJson(row: MedicationRow): MedicationJson {
  return { id: row.id, encounterId: row.encounter_id, medication: row.medication, dosage: row.dosage };
}

const SELECT =
  "SELECT id, encounter_id, medication, dosage FROM medication_requests";

export class SqliteMedicationsRepository implements MedicationsRepository {
  async findByEncounterId(encounterId: number) {
    const rows = db.prepare(`${SELECT} WHERE encounter_id = ? ORDER BY id`).all(encounterId) as MedicationRow[];
    return rows.map(sqliteToJson);
  }
  async create(encounterId: number, input: CreateMedicationInput) {
    const result = db
      .prepare(`INSERT INTO medication_requests (encounter_id, medication, dosage) VALUES (?, ?, ?)`)
      .run(encounterId, input.medication, input.dosage);
    const row = db.prepare(`${SELECT} WHERE id = ?`).get(result.lastInsertRowid) as MedicationRow;
    return sqliteToJson(row);
  }
}

export class PrismaMedicationsRepository implements MedicationsRepository {
  async findByEncounterId(encounterId: number) {
    return prisma.medicationRequest.findMany({
      where: { encounterId },
      orderBy: { id: "asc" },
      select: { id: true, encounterId: true, medication: true, dosage: true },
    });
  }
  async create(encounterId: number, input: CreateMedicationInput) {
    return prisma.medicationRequest.create({
      data: { encounterId, medication: input.medication, dosage: input.dosage },
      select: { id: true, encounterId: true, medication: true, dosage: true },
    });
  }
}

export const medicationsRepository: MedicationsRepository =
  new PrismaMedicationsRepository();
