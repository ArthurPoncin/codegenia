// Voir docs/04_api_endpoints.md — schéma d'erreur standard
export class ApiError extends Error {
  constructor({ message, code, status, details, traceId, cause } = {}) {
    super(message ?? "API request failed");
    this.name = "ApiError";
    this.code = code ?? "API_ERROR";
    this.status = status ?? null;
    if (details !== undefined) this.details = details;
    if (traceId !== undefined) this.traceId = traceId;
    if (cause) this.cause = cause;
  }
}

export function isApiError(error) {
  return error instanceof ApiError;
}

export function createAbortError(message = "Operation aborted") {
  const abortError = new Error(message);
  abortError.name = "AbortError";
  abortError.code = "ABORT_ERR";
  return abortError;
}
