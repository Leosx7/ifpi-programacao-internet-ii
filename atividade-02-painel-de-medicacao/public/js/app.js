import {
  listMedications,
  createMedication,
  getMedication,
  removeMedication,
} from "./api.js";

import {
  subscribe,
  getState,
  setMedications,
  setError,
  addMedication,
  selectMedication,
  setSelectedMedication,
  clearSelection,
  setDetailError,
  removeMedicationFromState,
} from "./state.js";

import {
  renderMedicationList,
  renderCounter,
  renderLoading,
  renderError,
  renderDetail,
} from "./render.js";

const medicationListElement = document.querySelector("#medication-list");
const resultCounterElement = document.querySelector("#result-counter");
const detailPanelElement = document.querySelector("#detail-panel");

const patientNameInput = document.querySelector("#patient-name-input");
const medicationNameInput = document.querySelector("#medication-name-input");
const dosageInput = document.querySelector("#dosage-input");
const routeInput = document.querySelector("#route-input");
const scheduledAtInput = document.querySelector("#scheduled-at-input");
const notesInput = document.querySelector("#notes-input");
const saveButton = document.querySelector("#save-button");
const formFeedbackElement = document.querySelector("#form-feedback");

function setFormFeedback(message, kind = "success") {
  formFeedbackElement.textContent = message;
  formFeedbackElement.className = `med-form__feedback med-form__feedback--${kind}`;
}

function clearForm() {
  patientNameInput.value = "";
  medicationNameInput.value = "";
  dosageInput.value = "";
  routeInput.value = "Oral";
  scheduledAtInput.value = "";
  notesInput.value = "";
}

function renderApp(state) {
  if (state.errorMessage) {
    renderError(state.errorMessage, medicationListElement);
    resultCounterElement.textContent = "";
    renderDetail(state, detailPanelElement);
    return;
  }

  if (state.isLoading) {
    renderLoading(medicationListElement);
    resultCounterElement.textContent = "";
    renderDetail(state, detailPanelElement);
    return;
  }

  renderMedicationList(state.medications, medicationListElement);
  renderDetail(state, detailPanelElement);
  renderCounter(state.medications.length, resultCounterElement);
}

subscribe(renderApp);

async function start() {
  renderApp(getState());

  try {
    const medications = await listMedications();
    setMedications(medications);
  } catch (error) {
    setError(error.message);
  }
}

saveButton.addEventListener("click", async () => {
  saveButton.disabled = true;
  setFormFeedback("");

  try {
    const created = await createMedication({
      patientName: patientNameInput.value,
      medicationName: medicationNameInput.value,
      dosage: dosageInput.value,
      route: routeInput.value,
      scheduledAt: scheduledAtInput.value,
      notes: notesInput.value,
    });

    addMedication(created);
    clearForm();
    setFormFeedback("Prescrição cadastrada com sucesso.");
  } catch (error) {
    setFormFeedback(error.message, "error");
  } finally {
    saveButton.disabled = false;
  }
});

medicationListElement.addEventListener("click", (event) => {
  const card = event.target.closest("[data-medication-id]");
  if (card) openDetail(Number(card.dataset.medicationId));
});

medicationListElement.addEventListener("keydown", (event) => {
  if (
    (event.key === "Enter" || event.key === " ") &&
    event.target.matches("[data-medication-id]")
  ) {
    event.preventDefault();
    openDetail(Number(event.target.dataset.medicationId));
  }
});

async function openDetail(id) {
  selectMedication(id);

  try {
    const medication = await getMedication(id);
    setSelectedMedication(medication);
  } catch (error) {
    setDetailError(error.message);
  }
}

detailPanelElement.addEventListener("click", async (event) => {
  if (event.target.id === "close-detail-button") {
    clearSelection();
    return;
  }

  if (event.target.id === "remove-button") {
    const { selectedId } = getState();
    if (selectedId === null) return;

    try {
      await removeMedication(selectedId);
      removeMedicationFromState(selectedId);
    } catch (error) {
      setDetailError(error.message);
    }
  }
});

start();
