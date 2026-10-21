import express from "express";
import { db } from "./database";

const app = express();
const PORT = 3000;
app.use(express.json());
app.use(express.static("public"));

app.get("/api/health", (_req,res)=>res.json({status:"ok"}));

function patientExists(id:number){ return !!db.prepare("SELECT id FROM patients WHERE id = ?").get(id); }
function toPatient(row:any){ return {id:row.id,name:row.name,birthDate:row.birth_date,nationalId:row.national_id,active:Boolean(row.active),encounterCount:Number(row.encounter_count ?? 0)}; }
function toEncounter(row:any){ return {id:row.id,patientId:row.patient_id,startedAt:row.started_at,chiefComplaint:row.chief_complaint,notes:row.notes}; }

app.get("/api/patients", (_req,res)=>{
  const rows=db.prepare("SELECT p.id,p.name,p.birth_date,p.national_id,p.active, COUNT(e.id) AS encounter_count FROM patients p LEFT JOIN encounters e ON e.patient_id = p.id GROUP BY p.id ORDER BY p.name").all();
  res.json(rows.map(toPatient));
});

app.get("/api/patients/:id", (req,res)=>{
  const row=db.prepare("SELECT p.id,p.name,p.birth_date,p.national_id,p.active, COUNT(e.id) AS encounter_count FROM patients p LEFT JOIN encounters e ON e.patient_id = p.id WHERE p.id = ? GROUP BY p.id").get(Number(req.params.id));
  if(!row) return res.status(404).json({error:"Paciente não encontrado."});
  res.json(toPatient(row));
});

app.post("/api/patients", (req,res)=>{
  const {name,birthDate,nationalId}=req.body ?? {};
  if(typeof name!=="string" || !name.trim()) return res.status(400).json({error:"name é obrigatório."});
  if(typeof birthDate!=="string" || !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) return res.status(400).json({error:"birthDate deve estar no formato AAAA-MM-DD."});
  if(typeof nationalId!=="string" || !nationalId.trim()) return res.status(400).json({error:"nationalId é obrigatório."});
  try {
    const info=db.prepare("INSERT INTO patients (name,birth_date,national_id,active) VALUES (?,?,?,1)").run(name.trim(),birthDate,nationalId.trim());
    const row=db.prepare("SELECT id,name,birth_date,national_id,active FROM patients WHERE id=?").get(info.lastInsertRowid);
    res.status(201).json(toPatient(row));
  } catch(e:any){
    if(String(e?.message).includes("UNIQUE")) return res.status(409).json({error:"CNS já cadastrado."});
    throw e;
  }
});

app.get("/api/patients/:id/encounters", (req,res)=>{
  const patientId=Number(req.params.id);
  if(!patientExists(patientId)) return res.status(404).json({error:"Paciente não encontrado."});
  const rows=db.prepare("SELECT id,patient_id,started_at,chief_complaint,notes FROM encounters WHERE patient_id = ? ORDER BY started_at DESC, id DESC").all(patientId);
  res.json(rows.map(toEncounter));
});

app.post("/api/patients/:id/encounters", (req,res)=>{
  const patientId=Number(req.params.id);
  if(!patientExists(patientId)) return res.status(404).json({error:"Paciente não encontrado."});
  const {startedAt,chiefComplaint,notes}=req.body ?? {};
  if(typeof chiefComplaint!=="string" || !chiefComplaint.trim()) return res.status(400).json({error:"chiefComplaint é obrigatório."});
  if(typeof startedAt!=="string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(startedAt)) return res.status(400).json({error:"startedAt deve estar no formato AAAA-MM-DDTHH:MM."});
  const normalizedNotes = typeof notes === "string" && notes.trim() ? notes.trim() : null;
  const info=db.prepare("INSERT INTO encounters (patient_id,started_at,chief_complaint,notes) VALUES (?,?,?,?)").run(patientId,startedAt,chiefComplaint.trim(),normalizedNotes);
  const row=db.prepare("SELECT id,patient_id,started_at,chief_complaint,notes FROM encounters WHERE id=?").get(info.lastInsertRowid);
  res.status(201).json(toEncounter(row));
});

app.listen(PORT,()=>console.log(`Mini-Prontuario no ar em http://localhost:${PORT}`));
