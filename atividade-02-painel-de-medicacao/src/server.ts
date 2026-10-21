import express from "express";
import { db } from "./database";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("public"));

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
});

type MedicationRow = {
  id: number;
  patient_name: string;
  medication_name: string;
  dosage: string;
  route: string;
  scheduled_at: string;
  notes: string | null;
};

function toMedicationJson(row: MedicationRow) {
  return {
    id: row.id,
    patientName: row.patient_name,
    medicationName: row.medication_name,
    dosage: row.dosage,
    route: row.route,
    scheduledAt: row.scheduled_at,
    notes: row.notes,
  };
}

function isBlank(value: unknown) {
  return typeof value !== "string" || value.trim().length === 0;
}

function validateMedicationInput(body: unknown) {
  if (!body || typeof body !== "object") return "Corpo da requisição inválido.";
  const input = body as Record<string, unknown>;
  if (isBlank(input.patientName)) return "patientName é obrigatório.";
  if (isBlank(input.medicationName)) return "medicationName é obrigatório.";
  if (isBlank(input.dosage)) return "dosage é obrigatório.";
  if (isBlank(input.route)) return "route é obrigatório.";
  if (isBlank(input.scheduledAt)) return "scheduledAt é obrigatório.";
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(String(input.scheduledAt))) {
    return "scheduledAt deve estar no formato AAAA-MM-DDTHH:MM.";
  }
  return null;
}

app.get("/api/medications", (request, response) => {
  const patientName = request.query.patientName;
  let rows: MedicationRow[];

  if (typeof patientName === "string" && patientName.trim()) {
    rows = db.prepare(
      `SELECT id, patient_name, medication_name, dosage, route, scheduled_at, notes
         FROM medication_orders
        WHERE patient_name LIKE ?
        ORDER BY scheduled_at ASC`
    ).all(`%${patientName.trim()}%`) as MedicationRow[];
  } else {
    rows = db.prepare(
      `SELECT id, patient_name, medication_name, dosage, route, scheduled_at, notes
         FROM medication_orders
        ORDER BY scheduled_at ASC`
    ).all() as MedicationRow[];
  }

  response.status(200).json(rows.map(toMedicationJson));
});

app.post("/api/medications", (request, response) => {
  const problem = validateMedicationInput(request.body);
  if (problem) {
    response.status(400).json({ error: problem });
    return;
  }

  const { patientName, medicationName, dosage, route, scheduledAt, notes } = request.body;
  const normalizedNotes = isBlank(notes) ? null : String(notes).trim();

  const result = db.prepare(
    `INSERT INTO medication_orders
       (patient_name, medication_name, dosage, route, scheduled_at, notes)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(
    patientName.trim(), medicationName.trim(), dosage.trim(),
    route.trim(), scheduledAt.trim(), normalizedNotes
  );

  const created = db.prepare(
    `SELECT id, patient_name, medication_name, dosage, route, scheduled_at, notes
       FROM medication_orders WHERE id = ?`
  ).get(result.lastInsertRowid) as MedicationRow;

  response.status(201).json(toMedicationJson(created));
});

app.get("/api/medications/:id", (request, response) => {
  const row = db.prepare(
    `SELECT id, patient_name, medication_name, dosage, route, scheduled_at, notes
       FROM medication_orders WHERE id = ?`
  ).get(request.params.id) as MedicationRow | undefined;

  if (!row) {
    response.status(404).json({ error: "Prescrição não encontrada." });
    return;
  }

  response.status(200).json(toMedicationJson(row));
});

app.delete("/api/medications/:id", (request, response) => {
  const existing = db.prepare("SELECT id FROM medication_orders WHERE id = ?").get(request.params.id);
  if (!existing) {
    response.status(404).json({ error: "Prescrição não encontrada." });
    return;
  }

  db.prepare("DELETE FROM medication_orders WHERE id = ?").run(request.params.id);
  response.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Painel de Medicacao no ar em http://localhost:${PORT}`);
});
