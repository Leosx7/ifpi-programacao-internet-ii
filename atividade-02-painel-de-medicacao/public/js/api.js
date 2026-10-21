const MEDICATIONS_URL = "/api/medications";

async function readError(response, fallback) {
  try {
    const body = await response.json();
    return body.error || fallback;
  } catch {
    return fallback;
  }
}

export async function listMedications() {
  const response = await fetch(MEDICATIONS_URL);

  if (!response.ok) {
    throw new Error(`Não foi possível carregar (HTTP ${response.status})`);
  }

  return response.json();
}

export async function createMedication(medication) {
  const response = await fetch(MEDICATIONS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(medication),
  });

  if (!response.ok) {
    throw new Error(
      await readError(response, "Não foi possível cadastrar a prescrição.")
    );
  }

  return response.json();
}

export async function getMedication(id) {
  const response = await fetch(`${MEDICATIONS_URL}/${id}`);

  if (response.status === 404) {
    throw new Error("Prescrição não encontrada.");
  }

  if (!response.ok) {
    throw new Error(
      await readError(response, "Não foi possível carregar a prescrição.")
    );
  }

  return response.json();
}

export async function removeMedication(id) {
  const response = await fetch(`${MEDICATIONS_URL}/${id}`, {
    method: "DELETE",
  });

  if (response.status === 404) {
    throw new Error("Prescrição não encontrada.");
  }

  if (response.status !== 204) {
    throw new Error(
      await readError(response, "Não foi possível suspender a prescrição.")
    );
  }
}
