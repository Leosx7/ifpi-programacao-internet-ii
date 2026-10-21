import { listPatients, createPatient, uploadPatientPhoto } from "./api.js";
import {
  state, setPatients, addPatient, replacePatient, setFormError,
  clearFormError, setPhotoPreview, clearPhotoPreview,
} from "./state.js";
import { render } from "./render.js";
import { renderApiError } from "./errors.js";

const selectedPhotoFiles = new Map();

async function init() {
  try {
    const patients = await listPatients();
    setPatients(patients);
  } catch (err) {
    setFormError(err.message ?? "Falha ao carregar pacientes.");
  }
  render();
}

document.getElementById("patient-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  clearFormError();

  const form = event.target;
  const payload = {
    name: form.name.value,
    birthDate: form.birthDate.value,
    nationalId: form.nationalId.value,
  };

  try {
    const created = await createPatient(payload);
    addPatient(created);
    form.reset();
    render();
  } catch (err) {
    renderApiError(err.apiError);
  }
});

document.getElementById("patient-list").addEventListener("change", (event) => {
  const input = event.target.closest("[data-photo-input]");
  if (!input) return;

  const patientId = Number(input.dataset.photoInput);
  const file = input.files?.[0];
  if (!file) return;

  const previousUrl = state.photoPreviews[patientId];
  if (previousUrl) URL.revokeObjectURL(previousUrl);

  const previewUrl = URL.createObjectURL(file);
  selectedPhotoFiles.set(patientId, file);
  setPhotoPreview(patientId, previewUrl);
  render();
});

document.getElementById("patient-list").addEventListener("click", async (event) => {
  const button = event.target.closest("[data-upload-photo]");
  if (!button) return;

  const patientId = Number(button.dataset.uploadPhoto);
  const file = selectedPhotoFiles.get(patientId);

  if (!file) {
    setFormError("Selecione uma imagem antes de enviar.");
    render();
    return;
  }

  clearFormError();
  button.disabled = true;

  try {
    const updated = await uploadPatientPhoto(patientId, file);
    replacePatient(updated);

    const previewUrl = state.photoPreviews[patientId];
    if (previewUrl) URL.revokeObjectURL(previewUrl);

    selectedPhotoFiles.delete(patientId);
    clearPhotoPreview(patientId);
    render();
  } catch (err) {
    renderApiError(err.apiError);
  } finally {
    button.disabled = false;
  }
});

init();
