export class TokenError extends Error {
  constructor(code, message, meta = {}) {
    super(message);
    this.name = "TokenError";
    this.code = code;
    this.meta = meta;
  }
}

export const TOKEN_ERROR_CODES = {
  BALANCE_NOT_READY: "BALANCE_NOT_READY",
  INSUFFICIENT_TOKENS: "INSUFFICIENT_TOKENS",
  MISSING_IDEMPOTENCY_KEY: "MISSING_IDEMPOTENCY_KEY",
  MISSING_POKEMON_ID: "MISSING_POKEMON_ID",
};
