const PATIENTS_URL = "/api/patients";
async function readError(response, fallback){ try { const b=await response.json(); return b.error || fallback; } catch { return fallback; } }
export async function listPatients(){ const r=await fetch(PATIENTS_URL); if(!r.ok) throw new Error(await readError(r,`HTTP ${r.status}`)); return r.json(); }
export async function getPatient(id){ const r=await fetch(`/api/patients/${id}`); if(!r.ok) throw new Error(await readError(r,"Paciente não encontrado.")); return r.json(); }
export async function createPatient(patient){ const r=await fetch(PATIENTS_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(patient)}); if(!r.ok) throw new Error(await readError(r,"Não foi possível cadastrar.")); return r.json(); }
export async function listEncounters(patientId){ const r=await fetch(`/api/patients/${patientId}/encounters`); if(!r.ok) throw new Error(await readError(r,"Não foi possível carregar os atendimentos.")); return r.json(); }
export async function createEncounter(patientId, encounter){ const r=await fetch(`/api/patients/${patientId}/encounters`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(encounter)}); if(!r.ok) throw new Error(await readError(r,"Não foi possível registrar o atendimento.")); return r.json(); }
