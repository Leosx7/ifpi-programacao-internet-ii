import { state } from "./state.js";

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function render() {
  renderFormError();
  renderPatientList();
}

function renderFormError() {
  const container = document.getElementById("form-error-container");
  container.innerHTML = "";
  if (!state.formError) return;

  const box = document.createElement("div");
  box.className = "form-error";

  const title = document.createElement("div");
  title.textContent = state.formError;
  box.appendChild(title);

  const entries = Object.entries(state.fieldErrors ?? {});
  if (entries.length > 0) {
    const list = document.createElement("ul");
    list.className = "mb-0 mt-2";

    for (const [field, messages] of entries) {
      const item = document.createElement("li");
      const message = Array.isArray(messages) ? messages.join(" ") : String(messages);
      item.textContent = `${field}: ${message}`;
      list.appendChild(item);
    }

    box.appendChild(list);
  }

  container.appendChild(box);
}

function renderPatientList() {
  const list = document.getElementById("patient-list");
  list.innerHTML = "";

  for (const patient of state.patients) {
    const li = document.createElement("li");
    li.className = "patient-card";
    li.dataset.patientId = patient.id;

    const previewUrl = state.photoPreviews[patient.id];
    const photoSrc = previewUrl || patient.photoUrl || "";

    li.innerHTML = `
      ${photoSrc
        ? `<img class="patient-card__photo" src="${escapeHtml(photoSrc)}" alt="Foto de ${escapeHtml(patient.name)}" />`
        : `<div class="patient-card__photo" aria-hidden="true"></div>`}
      <div class="patient-card__content">
        <p class="patient-card__name">${escapeHtml(patient.name)}</p>
        <p class="patient-card__meta">CNS ${escapeHtml(patient.nationalId)} · ${patient.active ? "ativo" : "inativo"}</p>
        <div class="patient-card__photo-actions mt-2">
          <label class="form-label mb-1" for="photo-${patient.id}">Foto do paciente</label>
          <input id="photo-${patient.id}" class="form-control form-control-sm" type="file" accept="image/jpeg,image/png" data-photo-input="${patient.id}" />
          <button class="btn btn-outline-success btn-sm mt-2" type="button" data-upload-photo="${patient.id}">Enviar foto</button>
        </div>
      </div>
    `;

    list.appendChild(li);
  }
}
