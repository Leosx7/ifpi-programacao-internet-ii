const PATIENTS_URL = "/api/patients";

async function parseBody(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function requestJson(url, options, fallback) {
  const response = await fetch(url, options);
  const body = await parseBody(response);

  if (!response.ok) {
    throw { apiError: body ?? { error: { message: fallback, details: null } } };
  }

  return body;
}

export function listPatients() {
  return requestJson(PATIENTS_URL, undefined, "Não foi possível carregar pacientes.");
}

export function getPatient(id) {
  return requestJson(`${PATIENTS_URL}/${id}`, undefined, "Paciente não encontrado.");
}

export function createPatient(patient) {
  return requestJson(PATIENTS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patient),
  }, "Não foi possível cadastrar o paciente.");
}

export function listEncounters(patientId) {
  return requestJson(`${PATIENTS_URL}/${patientId}/encounters`, undefined, "Não foi possível carregar os atendimentos.");
}

export function createEncounter(patientId, encounter) {
  return requestJson(`${PATIENTS_URL}/${patientId}/encounters`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(encounter),
  }, "Não foi possível registrar o atendimento.");
}

export function uploadPatientPhoto(patientId, file) {
  const formData = new FormData();
  formData.append("photo", file);

  return requestJson(`${PATIENTS_URL}/${patientId}/photo`, {
    method: "POST",
    body: formData,
  }, "Não foi possível enviar a foto.");
}
