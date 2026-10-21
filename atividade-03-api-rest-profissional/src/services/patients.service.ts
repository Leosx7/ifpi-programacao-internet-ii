import { db } from "../db/database.ts";
import { ConflictError, NotFoundError } from "../errors/HttpError.ts";

type PatientRow = {
  id: number;
  name: string;
  birth_date: string;
  national_id: string;
  active: number;
  photo_path: string | null;
  encounter_count?: number;
};

export type CreatePatientInput = {
  name: string;
  birthDate: string;
  nationalId: string;
};

function toPatientJson(row: PatientRow) {
  return {
    id: row.id,
    name: row.name,
    birthDate: row.birth_date,
    nationalId: row.national_id,
    active: row.active === 1,
    encounterCount: Number(row.encounter_count ?? 0),
    photoUrl: row.photo_path,
  };
}

function selectPatientById(id: string | number) {
  return db.prepare(`
    SELECT p.id, p.name, p.birth_date, p.national_id, p.active, p.photo_path,
           COUNT(e.id) AS encounter_count
      FROM patients p
      LEFT JOIN encounters e ON e.patient_id = p.id
     WHERE p.id = ?
     GROUP BY p.id
  `).get(id) as PatientRow | undefined;
}

export const patientsService = {
  list() {
    const rows = db.prepare(`
      SELECT p.id, p.name, p.birth_date, p.national_id, p.active, p.photo_path,
             COUNT(e.id) AS encounter_count
        FROM patients p
        LEFT JOIN encounters e ON e.patient_id = p.id
       GROUP BY p.id
       ORDER BY p.name
    `).all() as PatientRow[];

    return rows.map(toPatientJson);
  },

  getById(id: string) {
    const row = selectPatientById(id);
    if (!row) throw new NotFoundError("Paciente não encontrado.");
    return toPatientJson(row);
  },

  create(input: CreatePatientInput) {
    const nationalId = input.nationalId.trim();

    const duplicate = db
      .prepare("SELECT id FROM patients WHERE national_id = ?")
      .get(nationalId);

    if (duplicate) {
      throw new ConflictError("CNS já cadastrado.");
    }

    const result = db.prepare(`
      INSERT INTO patients (name, birth_date, national_id, active)
      VALUES (?, ?, ?, 1)
    `).run(input.name.trim(), input.birthDate, nationalId);

    return toPatientJson(selectPatientById(Number(result.lastInsertRowid))!);
  },

  updatePhoto(id: string, filename: string) {
    if (!selectPatientById(id)) {
      throw new NotFoundError("Paciente não encontrado.");
    }

    const photoUrl = `/uploads/${filename}`;
    db.prepare("UPDATE patients SET photo_path = ? WHERE id = ?")
      .run(photoUrl, id);

    return toPatientJson(selectPatientById(id)!);
  },
};
