import { STORE_POKEMONS, STORE_TOKENS } from "@/db/indexedDB.js";
import {
  GENERATION_COST,
  INITIAL_TOKENS,
  RESALE_REWARD,
  TOKEN_DOCUMENT_ID,
} from "@/lib/constants.js";
import { validatePokemonDocument } from "@/lib/validators.js";
import { getTokenDocument } from "@/db/tokens.js";

export const DB_ERROR_CODES = {
  INSUFFICIENT_TOKENS: "INSUFFICIENT_TOKENS",
  POKEMON_NOT_FOUND: "POKEMON_NOT_FOUND",
};

function createDBError(code) {
  const error = new Error(code);
  error.code = code;
  return error;
}

// Voir docs/03_indexeddb_schema.md — opérations atomiques
export async function txGeneratePokemon(db, pokemonDoc) {
  const doc = validatePokemonDocument(pokemonDoc);
  const createdAt = doc.createdAt ?? Date.now();
  const timestamp = Date.now();
  const payload = {
    ...doc,
    createdAt,
    updatedAt: timestamp,
  };

  const tx = db.transaction([STORE_TOKENS, STORE_POKEMONS], "readwrite");
  const tokensStore = tx.objectStore(STORE_TOKENS);
  const pokemonsStore = tx.objectStore(STORE_POKEMONS);

  let tokens = await tokensStore.get(TOKEN_DOCUMENT_ID);
  if (!tokens) {
    tokens = {
      id: TOKEN_DOCUMENT_ID,
      balance: INITIAL_TOKENS,
      updatedAt: timestamp,
    };
  }

  if (tokens.balance < GENERATION_COST) {
    tx.abort();
    throw createDBError(DB_ERROR_CODES.INSUFFICIENT_TOKENS);
  }

  tokens.balance -= GENERATION_COST;
  tokens.updatedAt = timestamp;

  await tokensStore.put(tokens);
  await pokemonsStore.put(payload);
  await tx.done;

  return { newBalance: tokens.balance, pokemon: payload };
}

export async function txSellPokemon(db, pokemonId) {
  const tx = db.transaction([STORE_TOKENS, STORE_POKEMONS], "readwrite");
  const tokensStore = tx.objectStore(STORE_TOKENS);
  const pokemonsStore = tx.objectStore(STORE_POKEMONS);

  const timestamp = Date.now();
  const pokemon = await pokemonsStore.get(pokemonId);
  if (!pokemon) {
    tx.abort();
    throw createDBError(DB_ERROR_CODES.POKEMON_NOT_FOUND);
  }

  await pokemonsStore.delete(pokemonId);

  let tokens = await tokensStore.get(TOKEN_DOCUMENT_ID);
  if (!tokens) {
    tokens = {
      id: TOKEN_DOCUMENT_ID,
      balance: INITIAL_TOKENS,
      updatedAt: timestamp,
    };
  }

  tokens.balance += RESALE_REWARD;
  tokens.updatedAt = timestamp;

  await tokensStore.put(tokens);
  await tx.done;

  return { newBalance: tokens.balance, sold: pokemon };
}

export async function exportDB(db) {
  const [tokens, pokemons] = await Promise.all([
    getTokenDocument(db),
    db.getAll(STORE_POKEMONS),
  ]);
  return JSON.stringify({ tokens, pokemons }, null, 2);
}

export async function importDB(db, json) {
  const data = typeof json === "string" ? JSON.parse(json) : json;
  const tx = db.transaction([STORE_TOKENS, STORE_POKEMONS], "readwrite");
  const tokensStore = tx.objectStore(STORE_TOKENS);
  const pokemonsStore = tx.objectStore(STORE_POKEMONS);

  if (data.tokens) {
    await tokensStore.put({
      ...data.tokens,
      id: TOKEN_DOCUMENT_ID,
      updatedAt: Date.now(),
    });
  }

  if (Array.isArray(data.pokemons)) {
    for (const pokemon of data.pokemons) {
      const validated = validatePokemonDocument(pokemon);
      await pokemonsStore.put({
        ...validated,
        createdAt: validated.createdAt ?? Date.now(),
        updatedAt: Date.now(),
      });
    }
  }

  await tx.done;
}
