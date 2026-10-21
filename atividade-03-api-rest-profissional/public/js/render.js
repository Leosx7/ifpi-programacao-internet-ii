function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function formatDate(isoDate) {
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

function patientCardTemplate(patient) {
  const cardModifier = patient.active ? "" : " patient-card--inactive";
  const badgeModifier = patient.active ? "status-badge--active" : "status-badge--inactive";

  return `
    <li class="patient-card${cardModifier}" data-patient-id="${patient.id}" tabindex="0" role="button">
      <div class="patient-card__top">
        <h2 class="patient-card__name">${escapeHtml(patient.name)}</h2>
        <span class="status-badge ${badgeModifier}">${patient.active ? "Ativo" : "Inativo"}</span>
      </div>
      <p class="patient-card__meta">Nascimento: ${formatDate(patient.birthDate)}</p>
      <p class="patient-card__meta patient-card__id">CNS ${escapeHtml(patient.nationalId)} · #${patient.id}</p>
      <p class="patient-card__encounters">${patient.encounterCount ?? 0} atendimento(s)</p>
    </li>
  `;
}

export function renderPatientList(patients, searchTerm, container) {
  container.innerHTML = patients.length
    ? patients.map(patientCardTemplate).join("")
    : `<li><div class="empty-state"><strong>Nada por aqui</strong><p>${
        searchTerm
          ? `Nenhum paciente corresponde a “${escapeHtml(searchTerm)}”.`
          : "Nenhum paciente cadastrado ainda."
      }</p></div></li>`;
}

export function renderCounter(visibleCount, totalCount, container) {
  container.textContent =
    visibleCount === totalCount
      ? `${totalCount} paciente(s) no prontuário`
      : `${visibleCount} de ${totalCount} paciente(s)`;
}

export function renderLoading(container) {
  container.innerHTML =
    '<li><div class="empty-state"><strong>Carregando…</strong><p>Buscando os pacientes.</p></div></li>';
}

export function renderError(message, container) {
  container.innerHTML =
    `<li><div class="empty-state"><strong>Algo deu errado</strong><p>${escapeHtml(message)}</p></div></li>`;
}
