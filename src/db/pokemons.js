import { STORE_POKEMONS } from "@/db/indexedDB.js";
import { validatePokemonDocument } from "@/lib/validators.js";

// Voir docs/03_indexeddb_schema.md — helpers CRUD Pokémons
export async function listPokemons(db, { limit = 50, offset = 0 } = {}) {
  const all = await db.getAll(STORE_POKEMONS);
  all.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  return all.slice(offset, offset + limit);
}

export async function getPokemon(db, id) {
  return db.get(STORE_POKEMONS, id);
}

export async function putPokemon(db, pokemon) {
  const doc = validatePokemonDocument(pokemon);
  const payload = {
    ...doc,
    createdAt: doc.createdAt ?? Date.now(),
    updatedAt: Date.now(),
  };
  await db.put(STORE_POKEMONS, payload);
  return payload;
}

export async function deletePokemon(db, id) {
  await db.delete(STORE_POKEMONS, id);
}

export async function purgeOldPokemons(db, keepLast = 100) {
  const all = await db.getAll(STORE_POKEMONS);
  all.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  const toDelete = all.slice(keepLast);
  if (toDelete.length === 0) {
    return 0;
  }

  const tx = db.transaction(STORE_POKEMONS, "readwrite");
  const store = tx.store ?? tx.objectStore(STORE_POKEMONS);

  for (const pokemon of toDelete) {
    await store.delete(pokemon.id);
  }

  await tx.done;
  return toDelete.length;
}
