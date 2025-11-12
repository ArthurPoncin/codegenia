import "fake-indexeddb/auto";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useGeneratePokemon } from "@/features/pokemons/useGeneratePokemon.js";
import { TokensProvider, useTokens } from "@/features/tokens/useTokens.js";
import { initDB, STORE_POKEMONS } from "@/db/indexedDB.js";

const API_URL = "https://api.pokeforge.test";

const server = setupServer(
  rest.post(`${API_URL}/generate`, async (req, res, ctx) => {
    const body = await req.json();
    return res(
      ctx.status(202),
      ctx.json({
        jobId: "job_1",
        status: "queued",
        chargeApplied: true,
        balance: 90,
        prompt: body.prompt,
      })
    );
  }),
  rest.get(`${API_URL}/generate/job_1`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        jobId: "job_1",
        status: "succeeded",
        image: { id: "img_1", url: "https://cdn.test/img_1.png" },
        metadata: { rarity: "rare" },
      })
    );
  })
);

describe("useGeneratePokemon", () => {
  beforeAll(() => server.listen());
  afterEach(async () => {
    server.resetHandlers();
    await new Promise((resolve) => {
      const request = indexedDB.deleteDatabase("pokeforge-db");
      request.onsuccess = () => resolve();
      request.onerror = () => resolve();
    });
  });
  afterAll(() => server.close());

  it("debites tokens and stores the generated pokemon", async () => {
    const wrapper = ({ children }) => <TokensProvider mode="offline">{children}</TokensProvider>;

    const { result } = renderHook(() => {
      const tokens = useTokens();
      const generator = useGeneratePokemon({ pollIntervalMs: 10, mode: "offline" });
      return { tokens, generator };
    }, { wrapper });

    await waitFor(() => expect(result.current.tokens.balance).toBe(100));

    await act(async () => {
      await result.current.generator.generate("Test prompt", {
        pollingOptions: { intervalMs: 10 },
      });
    });

    await waitFor(() => expect(result.current.generator.status).toBe("succeeded"));
    expect(result.current.tokens.balance).toBe(90);

    const db = await initDB();
    const stored = await db.getAll(STORE_POKEMONS);
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe("img_1");
    expect(stored[0].rarity).toBe("rare");
  });
});
