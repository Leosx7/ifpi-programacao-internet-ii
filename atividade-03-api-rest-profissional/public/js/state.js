export const state = {
  patients: [],
  formError: null,
  fieldErrors: {},
  photoPreviews: {},
};

export function setPatients(patients) {
  state.patients = patients;
}

export function addPatient(patient) {
  state.patients = [...state.patients, patient].sort((a, b) => a.name.localeCompare(b.name));
}

export function replacePatient(updatedPatient) {
  state.patients = state.patients
    .map((patient) => patient.id === updatedPatient.id ? updatedPatient : patient)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function setFormError(message, fieldErrors = {}) {
  state.formError = message;
  state.fieldErrors = fieldErrors;
}

export function clearFormError() {
  state.formError = null;
  state.fieldErrors = {};
}

export function setPhotoPreview(patientId, previewUrl) {
  state.photoPreviews = { ...state.photoPreviews, [patientId]: previewUrl };
}

export function clearPhotoPreview(patientId) {
  const next = { ...state.photoPreviews };
  delete next[patientId];
  state.photoPreviews = next;
}
