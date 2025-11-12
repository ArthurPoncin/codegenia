import { openDB } from "idb";

export const DB_NAME = "pokeforge-db";
export const DB_VERSION = 1;
export const STORE_POKEMONS = "pokemons";
export const STORE_TOKENS = "tokens";

// Voir docs/03_indexeddb_schema.md — initialisation de la base
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

export async function resetDB(activeDb) {
  if (activeDb) {
    activeDb.close();
  }

  return new Promise((resolve, reject) => {
    const nativeIndexedDB = globalThis.indexedDB;

    if (!nativeIndexedDB) {
      reject(new Error("INDEXED_DB_UNAVAILABLE"));
      return;
    }

    const request = nativeIndexedDB.deleteDatabase(DB_NAME);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error("DB_RESET_BLOCKED"));
  });
}

export default initDB;
