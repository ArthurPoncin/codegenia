import { openDB } from "idb";

export const DB_NAME = "pokeforge-db";
export const DB_VERSION = 1;
export const STORE_POKEMONS = "pokemons";
export const STORE_TOKENS = "tokens";

export async function initDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_POKEMONS)) {
        db.createObjectStore(STORE_POKEMONS, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORE_TOKENS)) {
        db.createObjectStore(STORE_TOKENS, { keyPath: "id" });
      }
    },
  });
}

export default initDB;
