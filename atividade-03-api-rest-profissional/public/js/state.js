const state = {
  patients: [],
  searchTerm: "",
  onlyActive: false,
  isLoading: true,
  errorMessage: null,
};

const listeners = [];

export function subscribe(listener) {
  listeners.push(listener);
}

function notify() {
  const snapshot = getState();
  listeners.forEach((listener) => listener(snapshot));
}

export function getVisiblePatients() {
  const term = state.searchTerm.trim().toLowerCase();

  return state.patients.filter((patient) =>
    patient.name.toLowerCase().includes(term) &&
    (state.onlyActive ? patient.active : true)
  );
}

export function getState() {
  return {
    ...state,
    visiblePatients: getVisiblePatients(),
  };
}

export function setPatients(patients) {
  state.patients = patients;
  state.isLoading = false;
  state.errorMessage = null;
  notify();
}

export function addPatient(patient) {
  state.patients = [...state.patients, patient]
    .sort((a, b) => a.name.localeCompare(b.name));
  notify();
}

export function replacePatient(updated) {
  state.patients = state.patients.map((patient) =>
    patient.id === updated.id ? updated : patient
  );
  notify();
}

export function setSearchTerm(term) {
  state.searchTerm = term;
  notify();
}

export function setOnlyActive(onlyActive) {
  state.onlyActive = onlyActive;
  notify();
}

export function setError(message) {
  state.errorMessage = message;
  state.isLoading = false;
  notify();
}
