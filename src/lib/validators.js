import {
  MAX_POKEMON_NAME_LENGTH,
  MAX_PROMPT_LENGTH,
  POKEMON_RARITIES,
} from "@/lib/constants.js";

const raritySet = new Set(POKEMON_RARITIES);

export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
}

export function isValidImageUrl(value) {
  if (typeof value !== "string" || value.trim() === "") {
    return false;
  }

  if (value.startsWith("blob:")) {
    return true;
  }

  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
  } catch (error) {
    return false;
  }
}

// Voir docs/03_indexeddb_schema.md — validation des documents Pokémon
export function validatePokemonDocument(pokemon) {
  if (!pokemon || typeof pokemon !== "object") {
    throw new ValidationError("POKEMON_INVALID_PAYLOAD");
  }

  const id = typeof pokemon.id === "string" ? pokemon.id.trim() : "";
  const name = typeof pokemon.name === "string" ? pokemon.name.trim() : "";
  const prompt = typeof pokemon.prompt === "string" ? pokemon.prompt.trim() : undefined;
  const rarity = typeof pokemon.rarity === "string" ? pokemon.rarity.trim() : undefined;
  const imageUrl = typeof pokemon.imageUrl === "string" ? pokemon.imageUrl.trim() : "";

  if (!id) {
    throw new ValidationError("POKEMON_ID_REQUIRED");
  }
  if (!name) {
    throw new ValidationError("POKEMON_NAME_REQUIRED");
  }
  if (name.length > MAX_POKEMON_NAME_LENGTH) {
    throw new ValidationError("POKEMON_NAME_TOO_LONG");
  }
  if (!isValidImageUrl(imageUrl)) {
    throw new ValidationError("POKEMON_IMAGE_URL_INVALID");
  }
  if (prompt && prompt.length > MAX_PROMPT_LENGTH) {
    throw new ValidationError("POKEMON_PROMPT_TOO_LONG");
  }
  if (rarity && !raritySet.has(rarity)) {
    throw new ValidationError("POKEMON_RARITY_INVALID");
  }

  return {
    ...pokemon,
    id,
    name,
    prompt: prompt || undefined,
    rarity: rarity || undefined,
    imageUrl,
  };
}
