function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function renderApiError(body) {
  const error = body?.error ?? {};
  const message = error.message ?? "Não foi possível concluir a operação.";
  const details = error.details ?? null;

  let detailHtml = "";
  if (details && typeof details === "object") {
    const items = Object.entries(details)
      .flatMap(([field, messages]) =>
        (Array.isArray(messages) ? messages : [messages])
          .filter(Boolean)
          .map((text) => `<li><strong>${escapeHtml(field)}:</strong> ${escapeHtml(text)}</li>`)
      )
      .join("");

    if (items) detailHtml = `<ul class="mb-0 mt-2">${items}</ul>`;
  }

  return `<div class="api-error"><strong>${escapeHtml(message)}</strong>${detailHtml}</div>`;
}
