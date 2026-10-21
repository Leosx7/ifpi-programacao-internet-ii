import { db } from "../database";
import { prisma } from "./prisma";
import type { CreateEncounterInput } from "../validation/encounters.schemas";

export type EncounterJson = {
  id: number;
  patientId: number;
  startedAt: string;
  chiefComplaint: string;
  notes: string | null;
};

export type EncounterRecord = EncounterJson & {
  professionalId: number | null;
};

type EncounterRow = {
  id: number;
  patient_id: number;
  professional_id: number | null;
  started_at: string;
  chief_complaint: string;
  notes: string | null;
};

export interface EncountersRepository {
  findByPatientId(patientId: number): Promise<EncounterJson[]>;
  findById(id: number): Promise<EncounterRecord | undefined>;
  create(
    patientId: number,
    input: CreateEncounterInput,
    professionalId: number | null,
  ): Promise<number>;
}

function sqliteToRecord(row: EncounterRow): EncounterRecord {
  return {
    id: row.id,
    patientId: row.patient_id,
    professionalId: row.professional_id,
    startedAt: row.started_at,
    chiefComplaint: row.chief_complaint,
    notes: row.notes,
  };
}

function toJson(record: EncounterRecord): EncounterJson {
  const { professionalId: _professionalId, ...json } = record;
  return json;
}

const SELECT =
  "SELECT id, patient_id, professional_id, started_at, chief_complaint, notes FROM encounters";

export class SqliteEncountersRepository implements EncountersRepository {
  async findByPatientId(patientId: number) {
    const rows = db.prepare(`${SELECT} WHERE patient_id = ? ORDER BY started_at DESC`).all(patientId) as EncounterRow[];
    return rows.map((row) => toJson(sqliteToRecord(row)));
  }
  async findById(id: number) {
    const row = db.prepare(`${SELECT} WHERE id = ?`).get(id) as EncounterRow | undefined;
    return row ? sqliteToRecord(row) : undefined;
  }
  async create(patientId: number, input: CreateEncounterInput, professionalId: number | null) {
    const result = db
      .prepare(`INSERT INTO encounters (patient_id, professional_id, started_at, chief_complaint, notes) VALUES (?, ?, ?, ?, ?)`)
      .run(patientId, professionalId, input.startedAt, input.chiefComplaint, input.notes ?? null);
    return Number(result.lastInsertRowid);
  }
}

export class PrismaEncountersRepository implements EncountersRepository {
  async findByPatientId(patientId: number) {
    return prisma.encounter.findMany({
      where: { patientId },
      orderBy: { startedAt: "desc" },
      select: { id: true, patientId: true, startedAt: true, chiefComplaint: true, notes: true },
    });
  }
  async findById(id: number) {
    const row = await prisma.encounter.findUnique({
      where: { id },
      select: {
        id: true, patientId: true, professionalId: true,
        startedAt: true, chiefComplaint: true, notes: true,
      },
    });
    return row ?? undefined;
  }
  async create(patientId: number, input: CreateEncounterInput, professionalId: number | null) {
    const created = await prisma.encounter.create({
      data: {
        patientId,
        professionalId,
        startedAt: input.startedAt,
        chiefComplaint: input.chiefComplaint,
        notes: input.notes ?? null,
      },
      select: { id: true },
    });
    return created.id;
  }
}

export const encountersRepository: EncountersRepository =
  new PrismaEncountersRepository();
