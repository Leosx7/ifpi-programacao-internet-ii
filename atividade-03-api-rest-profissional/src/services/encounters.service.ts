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

const ISO_DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

function isBlank(value: unknown): boolean {
  return typeof value !== "string" || value.trim() === "";
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

function ensurePatientExists(id: string) {
  const patient = db.prepare("SELECT 1 FROM patients WHERE id = ?").get(id);
  if (!patient) throw new NotFoundError("Paciente nao encontrado.");
}

export const encountersService = {
  list(patientId: string) {
    ensurePatientExists(patientId);
    const rows = db
      .prepare(`SELECT id, patient_id, started_at, chief_complaint, notes
                  FROM encounters
                 WHERE patient_id = ?
                 ORDER BY started_at DESC`)
      .all(patientId) as EncounterRow[];
    return rows.map(toEncounterJson);
  },

  create(patientId: string, data: CreateEncounterInput) {
    ensurePatientExists(patientId);

    if (isBlank(data.chiefComplaint)) {
      throw new BadRequestError("O campo 'chiefComplaint' e obrigatorio.");
    }
    if (isBlank(data.startedAt) || !ISO_DATE_TIME.test(data.startedAt)) {
      throw new BadRequestError("O campo 'startedAt' e obrigatorio no formato AAAA-MM-DDTHH:MM.");
    }

    const notes = isBlank(data.notes) ? null : data.notes!.trim();
    const result = db
      .prepare(`INSERT INTO encounters (patient_id, started_at, chief_complaint, notes)
                 VALUES (?, ?, ?, ?)`)
      .run(patientId, data.startedAt, data.chiefComplaint.trim(), notes);

    const created = db
      .prepare(`SELECT id, patient_id, started_at, chief_complaint, notes
                  FROM encounters WHERE id = ?`)
      .get(result.lastInsertRowid) as EncounterRow;

    return toEncounterJson(created);
  },
};
