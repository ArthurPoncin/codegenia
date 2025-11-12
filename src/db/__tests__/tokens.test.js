import "fake-indexeddb/auto";
import { initDB, STORE_TOKENS } from "@/db/indexedDB.js";
import { ensureInitialTokens, getBalance, setBalance } from "@/db/tokens.js";

describe("tokens indexedDB helpers", () => {
  afterEach(async () => {
    await new Promise((resolve) => {
      const request = indexedDB.deleteDatabase("pokeforge-db");
      request.onsuccess = () => resolve();
      request.onerror = () => resolve();
    });
  });

  it("initialises to 100 tokens on first run", async () => {
    const db = await initDB();
    const balance = await ensureInitialTokens(db);
    expect(balance).toBe(100);
    expect(await getBalance(db)).toBe(100);
  });

  it("persists balance updates", async () => {
    const db = await initDB();
    await setBalance(db, 42);
    expect(await getBalance(db)).toBe(42);
    const stored = await db.get(STORE_TOKENS, "userTokens");
    expect(stored.balance).toBe(42);
  });
});
