import { db } from "../db/database.ts";
import { BadRequestError, NotFoundError } from "../errors/HttpError.ts";

type EncounterRow = {
  id: number;
  patient_id: number;
  started_at: string;
  chief_complaint: string;
  notes: string | null;
};

type CreateEncounterInput = {
  startedAt: string;
  chiefComplaint: string;
  notes?: string;
};

function patientExists(id: string) {
  return Boolean(db.prepare("SELECT id FROM patients WHERE id = ?").get(id));
}

function toEncounterJson(row: EncounterRow) {
  return {
    id: row.id,
    patientId: row.patient_id,
    startedAt: row.started_at,
    chiefComplaint: row.chief_complaint,
    notes: row.notes,
  };
}

export const encountersService = {
  list(patientId: string) {
    if (!patientExists(patientId)) {
      throw new NotFoundError("Paciente não encontrado.");
    }

    const rows = db.prepare(`
      SELECT id, patient_id, started_at, chief_complaint, notes
        FROM encounters
       WHERE patient_id = ?
       ORDER BY started_at DESC, id DESC
    `).all(patientId) as EncounterRow[];

    return rows.map(toEncounterJson);
  },

  create(patientId: string, input: CreateEncounterInput) {
    if (!patientExists(patientId)) {
      throw new NotFoundError("Paciente não encontrado.");
    }

    if (typeof input.chiefComplaint !== "string" || !input.chiefComplaint.trim()) {
      throw new BadRequestError("chiefComplaint é obrigatório.");
    }

    if (
      typeof input.startedAt !== "string" ||
      !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(input.startedAt)
    ) {
      throw new BadRequestError("startedAt deve estar no formato AAAA-MM-DDTHH:MM.");
    }

    const notes =
      typeof input.notes === "string" && input.notes.trim()
        ? input.notes.trim()
        : null;

    const result = db.prepare(`
      INSERT INTO encounters (patient_id, started_at, chief_complaint, notes)
      VALUES (?, ?, ?, ?)
    `).run(patientId, input.startedAt, input.chiefComplaint.trim(), notes);

    const row = db.prepare(`
      SELECT id, patient_id, started_at, chief_complaint, notes
        FROM encounters
       WHERE id = ?
    `).get(result.lastInsertRowid) as EncounterRow;

    return toEncounterJson(row);
  },
};
