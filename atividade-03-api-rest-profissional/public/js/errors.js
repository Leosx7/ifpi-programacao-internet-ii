import { setFormError } from "./state.js";
import { render } from "./render.js";

export function renderApiError(body) {
  const error = body?.error ?? {};
  setFormError(
    error.message ?? "Falha na operacao.",
    error.details ?? {}
  );
  render();
}
