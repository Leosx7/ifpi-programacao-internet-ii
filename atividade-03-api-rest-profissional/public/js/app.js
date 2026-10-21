import {
  listPatients,
  getPatient,
  createPatient,
  listEncounters,
  createEncounter,
  uploadPatientPhoto,
} from "./api.js";

import {
  subscribe,
  getState,
  setPatients,
  addPatient,
  replacePatient,
  setSearchTerm,
  setOnlyActive,
  setError,
} from "./state.js";

import {
  renderPatientList,
  renderCounter,
  renderLoading,
  renderError,
} from "./render.js";

import { renderApiError } from "./errors.js";

const searchInput = document.querySelector("#search-input");
const onlyActiveInput = document.querySelector("#only-active-input");
const patientListElement = document.querySelector("#patient-list");
const resultCounterElement = document.querySelector("#result-counter");
const listView = document.querySelector("#list-view");
const detailView = document.querySelector("#detail-view");
const patientForm = document.querySelector("#patient-form");
const formErrorContainer = document.querySelector("#form-error-container");

const esc = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const fmt = (value) => {
  const [date, time] = value.split("T");
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year} ${time}`;
};

function renderApp(state) {
  if (state.errorMessage) {
    renderError(state.errorMessage, patientListElement);
    resultCounterElement.textContent = "";
    return;
  }

  if (state.isLoading) {
    renderLoading(patientListElement);
    resultCounterElement.textContent = "";
    return;
  }

  renderPatientList(state.visiblePatients, state.searchTerm, patientListElement);
  renderCounter(
    state.visiblePatients.length,
    state.patients.length,
    resultCounterElement
  );
}

searchInput.addEventListener("input", (event) =>
  setSearchTerm(event.target.value)
);

onlyActiveInput.addEventListener("change", (event) =>
  setOnlyActive(event.target.checked)
);

subscribe(renderApp);

patientForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  formErrorContainer.innerHTML = "";

  const data = new FormData(patientForm);

  try {
    const created = await createPatient({
      name: data.get("name"),
      birthDate: data.get("birthDate"),
      nationalId: data.get("nationalId"),
    });

    addPatient(created);
    patientForm.reset();
  } catch (error) {
    formErrorContainer.innerHTML = renderApiError(error.apiError);
  }
});

patientListElement.addEventListener("click", (event) => {
  const card = event.target.closest("[data-patient-id]");
  if (card) openPatient(Number(card.dataset.patientId));
});

patientListElement.addEventListener("keydown", (event) => {
  if (
    (event.key === "Enter" || event.key === " ") &&
    event.target.matches("[data-patient-id]")
  ) {
    openPatient(Number(event.target.dataset.patientId));
  }
});

function back() {
  detailView.hidden = true;
  listView.hidden = false;
}

async function openPatient(id) {
  listView.hidden = true;
  detailView.hidden = false;
  detailView.innerHTML =
    '<div class="empty-state"><strong>Carregando…</strong><p>Buscando o prontuário.</p></div>';

  try {
    const [patient, encounters] = await Promise.all([
      getPatient(id),
      listEncounters(id),
    ]);

    renderDetail(patient, encounters);
  } catch (error) {
    detailView.innerHTML = `
      <div class="empty-state">
        ${renderApiError(error.apiError)}
        <button id="back-button" class="btn btn-outline-secondary mt-3">Voltar</button>
      </div>
    `;
    document.querySelector("#back-button").onclick = back;
  }
}

function renderDetail(patient, encounters) {
  detailView.innerHTML = `
    <div class="patient-detail">
      <header class="patient-detail__header">
        <div>
          <button id="back-button" class="btn btn-sm btn-outline-secondary mb-3">← Voltar</button>
          <h2>${esc(patient.name)}</h2>
          <p class="text-secondary mb-0">CNS ${esc(patient.nationalId)}</p>
        </div>
        <div>
          ${patient.photoUrl
            ? `<img class="patient-photo" src="${esc(patient.photoUrl)}" alt="Foto de ${esc(patient.name)}">`
            : '<div class="patient-photo"></div>'}
        </div>
      </header>

      <section class="encounter-list-wrap">
        <h3 class="h5">Atendimentos</h3>
        <ul class="encounter-list">
          ${encounters.length
            ? encounters.map((encounter) => `
              <li class="encounter-item">
                <div class="encounter-item__date">${fmt(encounter.startedAt)}</div>
                <p class="encounter-item__complaint">${esc(encounter.chiefComplaint)}</p>
                <p class="encounter-item__notes">${encounter.notes ? esc(encounter.notes) : "Sem observações."}</p>
              </li>
            `).join("")
            : '<li class="empty-state">Nenhum atendimento registrado.</li>'}
        </ul>
      </section>

      <div>
        <form id="encounter-form" class="encounter-form mb-3">
          <h3 class="h5">Novo atendimento</h3>
          <div class="mb-3">
            <label class="form-label" for="started-at">Início</label>
            <input class="form-control" id="started-at" name="startedAt" type="datetime-local">
          </div>
          <div class="mb-3">
            <label class="form-label" for="chief-complaint">Queixa principal</label>
            <textarea class="form-control" id="chief-complaint" name="chiefComplaint"></textarea>
          </div>
          <div class="mb-3">
            <label class="form-label" for="notes">Conduta / observações</label>
            <textarea class="form-control" id="notes" name="notes"></textarea>
          </div>
          <div id="encounter-error"></div>
          <button class="btn btn-success" type="submit">Registrar atendimento</button>
        </form>

        <form id="photo-form" class="photo-form">
          <h3 class="h5">Foto do paciente</h3>
          <input id="photo-input" class="form-control mb-3" type="file" accept="image/jpeg,image/png">
          <div id="photo-preview" class="mb-3"></div>
          <div id="photo-error"></div>
          <button class="btn btn-outline-success" type="submit">Enviar foto</button>
        </form>
      </div>
    </div>
  `;

  document.querySelector("#back-button").onclick = back;

  document.querySelector("#encounter-form").onsubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const errorBox = document.querySelector("#encounter-error");
    errorBox.innerHTML = "";

    try {
      await createEncounter(patient.id, {
        startedAt: data.get("startedAt"),
        chiefComplaint: data.get("chiefComplaint"),
        notes: data.get("notes"),
      });

      const fresh = await listEncounters(patient.id);
      const refreshedPatient = await getPatient(patient.id);
      replacePatient(refreshedPatient);
      renderDetail(refreshedPatient, fresh);
    } catch (error) {
      errorBox.innerHTML = renderApiError(error.apiError);
    }
  };

  const photoInput = document.querySelector("#photo-input");
  const photoPreview = document.querySelector("#photo-preview");
  let previewUrl = null;

  photoInput.addEventListener("change", () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    photoPreview.innerHTML = "";

    const file = photoInput.files?.[0];
    if (!file) return;

    previewUrl = URL.createObjectURL(file);
    photoPreview.innerHTML =
      `<img class="patient-photo" src="${previewUrl}" alt="Prévia da foto selecionada">`;
  });

  document.querySelector("#photo-form").onsubmit = async (event) => {
    event.preventDefault();
    const errorBox = document.querySelector("#photo-error");
    errorBox.innerHTML = "";

    const file = photoInput.files?.[0];

    try {
      const updated = await uploadPatientPhoto(patient.id, file);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      replacePatient(updated);
      renderDetail(updated, encounters);
    } catch (error) {
      errorBox.innerHTML = renderApiError(error.apiError);
    }
  };
}

async function start() {
  renderApp(getState());

  try {
    setPatients(await listPatients());
  } catch (error) {
    setError(error.apiError?.error?.message ?? "Não foi possível carregar os pacientes.");
  }
}

start();
