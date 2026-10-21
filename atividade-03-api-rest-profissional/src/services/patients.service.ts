import { db } from "../db/database.ts";
import { ConflictError, NotFoundError } from "../errors/HttpError.ts";

type PatientRow = {
  id: number;
  name: string;
  birth_date: string;
  national_id: string;
  active: number;
  photo_path: string | null;
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
    photoUrl: row.photo_path,
  };
}

function findRowById(id: string | number) {
  return db
    .prepare("SELECT id, name, birth_date, national_id, active, photo_path FROM patients WHERE id = ?")
    .get(id) as PatientRow | undefined;
}

export const patientsService = {
  list() {
    const rows = db
      .prepare("SELECT id, name, birth_date, national_id, active, photo_path FROM patients ORDER BY name")
      .all() as PatientRow[];
    return rows.map(toPatientJson);
  },

  getById(id: string) {
    const row = findRowById(id);
    if (!row) throw new NotFoundError("Paciente nao encontrado.");
    return toPatientJson(row);
  },

  create(data: CreatePatientInput) {
    const name = data.name.trim();
    const birthDate = data.birthDate;
    const nationalId = data.nationalId.trim();

    const duplicate = db
      .prepare("SELECT id FROM patients WHERE national_id = ?")
      .get(nationalId);

    if (duplicate) throw new ConflictError("Ja existe um paciente com este CNS.");

    const result = db
      .prepare(`INSERT INTO patients (name, birth_date, national_id, active)
                 VALUES (?, ?, ?, 1)`)
      .run(name, birthDate, nationalId);

    return toPatientJson(findRowById(Number(result.lastInsertRowid))!);
  },

  setPhoto(id: string, filename: string) {
    if (!findRowById(id)) throw new NotFoundError("Paciente nao encontrado.");

    const photoPath = `/uploads/${filename}`;
    db.prepare("UPDATE patients SET photo_path = ? WHERE id = ?").run(photoPath, id);

    return toPatientJson(findRowById(id)!);
  },
};
