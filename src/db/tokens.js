import { STORE_TOKENS } from "@/db/indexedDB.js";
import {
  INITIAL_TOKENS,
  TOKEN_DOCUMENT_ID,
} from "@/lib/constants.js";

// Voir docs/03_indexeddb_schema.md — gestion des jetons
export async function getTokenDocument(db) {
  return db.get(STORE_TOKENS, TOKEN_DOCUMENT_ID);
}

export async function ensureInitialTokens(db) {
  const existing = await getTokenDocument(db);
  if (!existing) {
    const doc = {
      id: TOKEN_DOCUMENT_ID,
      balance: INITIAL_TOKENS,
      updatedAt: Date.now(),
    };
    await db.put(STORE_TOKENS, doc);
    return doc.balance;
  }
  return existing.balance;
}

export async function getBalance(db) {
  const doc = await getTokenDocument(db);
  return doc?.balance ?? 0;
}

export async function setBalance(db, balance) {
  await db.put(STORE_TOKENS, {
    id: TOKEN_DOCUMENT_ID,
    balance,
    updatedAt: Date.now(),
  });
  return balance;
}

export async function writeTokenDocument(tx, doc) {
  return tx.objectStore(STORE_TOKENS).put({
    ...doc,
    id: TOKEN_DOCUMENT_ID,
    updatedAt: Date.now(),
  });
}
