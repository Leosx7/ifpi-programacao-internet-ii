function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function formatDateTime(isoDateTime) {
  const [datePart, timePart] = isoDateTime.split("T");
  const [year, month, day] = datePart.split("-");
  return `${day}/${month}/${year} às ${timePart}`;
}

function medicationCardTemplate(med) {
  return `
    <li class="medication-card" data-medication-id="${med.id}" role="button" tabindex="0">
      <h2 class="medication-card__name">${escapeHtml(med.medicationName)} — ${escapeHtml(med.dosage)}</h2>
      <p class="medication-card__meta">${escapeHtml(med.patientName)}</p>
      <p class="medication-card__meta">${escapeHtml(med.route)} · ${formatDateTime(med.scheduledAt)}</p>
    </li>
  `;
}

function emptyStateTemplate() {
  return `
    <li>
      <div class="empty-state">
        <p class="empty-state__title">Nada por aqui</p>
        <p class="m-0">Nenhuma prescrição cadastrada ainda.</p>
      </div>
    </li>
  `;
}

export function renderMedicationList(medications, container) {
  if (medications.length === 0) {
    container.innerHTML = emptyStateTemplate();
    return;
  }

  container.innerHTML = medications
    .map(medicationCardTemplate)
    .join("");
}

export function renderCounter(count, container) {
  container.textContent = `${count} prescrição(ões) no painel`;
}

export function renderLoading(container) {
  container.innerHTML = `<li><div class="empty-state"><p class="empty-state__title">Carregando…</p></div></li>`;
}

export function renderError(message, container) {
  container.innerHTML = `<li><div class="empty-state"><p class="empty-state__title">Algo deu errado</p><p class="m-0">${escapeHtml(message)}</p></div></li>`;
}

export function renderDetail(state, container) {
  if (state.selectedId === null) {
    container.hidden = true;
    container.innerHTML = "";
    return;
  }

  container.hidden = false;

  if (state.isLoadingDetail) {
    container.innerHTML = `<p class="m-0">Carregando detalhe…</p>`;
    return;
  }

  if (state.detailErrorMessage) {
    container.innerHTML = `
      <div class="d-flex justify-content-between gap-3 align-items-start">
        <div>
          <strong>Não foi possível abrir a prescrição.</strong>
          <p class="mb-0">${escapeHtml(state.detailErrorMessage)}</p>
        </div>
        <button id="close-detail-button" class="btn btn-outline-secondary btn-sm" type="button">Fechar</button>
      </div>
    `;
    return;
  }

  const med = state.selectedMedication;
  if (!med) {
    container.innerHTML = `<p class="m-0">Prescrição não encontrada no estado atual.</p>`;
    return;
  }

  container.innerHTML = `
    <div class="d-flex justify-content-between gap-3 align-items-start mb-3">
      <div>
        <p class="text-secondary mb-1">Prescrição #${med.id}</p>
        <h2 class="h4 mb-1">${escapeHtml(med.medicationName)} — ${escapeHtml(med.dosage)}</h2>
        <p class="mb-0">${escapeHtml(med.patientName)}</p>
      </div>
      <button id="close-detail-button" class="btn btn-outline-secondary btn-sm" type="button">Fechar</button>
    </div>

    <dl class="row mb-3">
      <dt class="col-sm-3">Via</dt>
      <dd class="col-sm-9">${escapeHtml(med.route)}</dd>

      <dt class="col-sm-3">Horário</dt>
      <dd class="col-sm-9">${formatDateTime(med.scheduledAt)}</dd>

      <dt class="col-sm-3">Observações</dt>
      <dd class="col-sm-9">${med.notes ? escapeHtml(med.notes) : "Sem observações."}</dd>
    </dl>

    <button id="remove-button" class="btn btn-outline-danger" type="button">Suspender</button>
  `;
}
