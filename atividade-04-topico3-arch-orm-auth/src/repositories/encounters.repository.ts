import { db } from "../database";
import type { CreateEncounterInput } from "../validation/encounters.schemas";

export type EncounterJson = {
  id: number;
  patientId: number;
  startedAt: string;
  chiefComplaint: string;
  notes: string | null;
};

type EncounterRow = {
  id: number;
  patient_id: number;
  started_at: string;
  chief_complaint: string;
  notes: string | null;
};

export interface EncountersRepository {
  findByPatientId(patientId: number): Promise<EncounterJson[]>;
  findById(id: number): Promise<EncounterJson | undefined>;
  create(patientId: number, input: CreateEncounterInput): Promise<number>;
}

function toEncounterJson(row: EncounterRow): EncounterJson {
  return {
    id: row.id,
    patientId: row.patient_id,
    startedAt: row.started_at,
    chiefComplaint: row.chief_complaint,
    notes: row.notes,
  };
}

const SELECT =
  "SELECT id, patient_id, started_at, chief_complaint, notes FROM encounters";

export class SqliteEncountersRepository implements EncountersRepository {
  async findByPatientId(patientId: number) {
    const rows = db
      .prepare(`${SELECT} WHERE patient_id = ? ORDER BY started_at DESC`)
      .all(patientId) as EncounterRow[];
    return rows.map(toEncounterJson);
  }

  async findById(id: number) {
    const row = db.prepare(`${SELECT} WHERE id = ?`).get(id) as EncounterRow | undefined;
    return row ? toEncounterJson(row) : undefined;
  }

  async create(patientId: number, input: CreateEncounterInput) {
    const result = db
      .prepare(
        `INSERT INTO encounters (patient_id, started_at, chief_complaint, notes)
         VALUES (?, ?, ?, ?)`,
      )
      .run(patientId, input.startedAt, input.chiefComplaint, input.notes ?? null);
    return Number(result.lastInsertRowid);
  }
}

export const encountersRepository: EncountersRepository =
  new SqliteEncountersRepository();
