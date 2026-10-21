import { db } from "../database";
import { prisma } from "./prisma";
import type { CreatePatientInput } from "../validation/patients.schemas";

export type PatientJson = {
  id: number;
  name: string;
  birthDate: string;
  nationalId: string;
  photoUrl: string | null;
  active: boolean;
};

type PatientRow = {
  id: number;
  name: string;
  birth_date: string;
  national_id: string;
  photo_url: string | null;
  active: number;
};

export interface PatientsRepository {
  findAll(): Promise<PatientJson[]>;
  findById(id: number): Promise<PatientJson | undefined>;
  findByNationalId(cns: string): Promise<{ id: number } | undefined>;
  create(input: CreatePatientInput): Promise<number>;
  updatePhoto(id: number, photoUrl: string): Promise<void>;
}

function sqliteToJson(row: PatientRow): PatientJson {
  return {
    id: row.id,
    name: row.name,
    birthDate: row.birth_date,
    nationalId: row.national_id,
    photoUrl: row.photo_url,
    active: row.active === 1,
  };
}

const SELECT =
  "SELECT id, name, birth_date, national_id, photo_url, active FROM patients";

export class SqlitePatientsRepository implements PatientsRepository {
  async findAll() {
    const rows = db.prepare(`${SELECT} ORDER BY name`).all() as PatientRow[];
    return rows.map(sqliteToJson);
  }
  async findById(id: number) {
    const row = db.prepare(`${SELECT} WHERE id = ?`).get(id) as PatientRow | undefined;
    return row ? sqliteToJson(row) : undefined;
  }
  async findByNationalId(cns: string) {
    return db.prepare("SELECT id FROM patients WHERE national_id = ?").get(cns) as { id: number } | undefined;
  }
  async create(input: CreatePatientInput) {
    const result = db
      .prepare(`INSERT INTO patients (name, birth_date, national_id, active) VALUES (?, ?, ?, 1)`)
      .run(input.name, input.birthDate, input.nationalId);
    return Number(result.lastInsertRowid);
  }
  async updatePhoto(id: number, photoUrl: string) {
    db.prepare("UPDATE patients SET photo_url = ? WHERE id = ?").run(photoUrl, id);
  }
}

function prismaToJson(row: {
  id: number; name: string; birthDate: string; nationalId: string;
  photoUrl: string | null; active: number;
}): PatientJson {
  return { ...row, active: row.active === 1 };
}

export class PrismaPatientsRepository implements PatientsRepository {
  async findAll() {
    const rows = await prisma.patient.findMany({ orderBy: { name: "asc" } });
    return rows.map(prismaToJson);
  }
  async findById(id: number) {
    const row = await prisma.patient.findUnique({ where: { id } });
    return row ? prismaToJson(row) : undefined;
  }
  async findByNationalId(cns: string) {
    const row = await prisma.patient.findUnique({
      where: { nationalId: cns },
      select: { id: true },
    });
    return row ?? undefined;
  }
  async create(input: CreatePatientInput) {
    const created = await prisma.patient.create({
      data: { name: input.name, birthDate: input.birthDate, nationalId: input.nationalId, active: 1 },
      select: { id: true },
    });
    return created.id;
  }
  async updatePhoto(id: number, photoUrl: string) {
    await prisma.patient.update({ where: { id }, data: { photoUrl } });
  }
}

export const patientsRepository: PatientsRepository =
  new PrismaPatientsRepository();
