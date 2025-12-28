import "fake-indexeddb/auto";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useGeneratePokemon } from "@/features/pokemons/useGeneratePokemon.js";
import { TokensProvider, useTokens } from "@/features/tokens/useTokens.js";
import { initDB, STORE_POKEMONS } from "@/db/indexedDB.js";

const API_URL = "https://pokeapi.co/api/v2";

const server = setupServer(
  rest.get(`${API_URL}/pokemon/pikachu`, (req, res, ctx) => {
    return res(
      ctx.json({
        id: 25,
        name: "pikachu",
        base_experience: 130,
        sprites: {
          other: {
            "official-artwork": {
              front_default: "https://cdn.test/pikachu.png",
            },
          },
        },
        species: { url: `${API_URL}/pokemon-species/25` },
      })
    );
  }),
  rest.get(`${API_URL}/pokemon-species/25`, (req, res, ctx) => {
    return res(
      ctx.json({
        is_legendary: false,
        is_mythical: false,
        capture_rate: 190,
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
      const generator = useGeneratePokemon({ mode: "offline" });
      return { tokens, generator };
    }, { wrapper });

    await waitFor(() => expect(result.current.tokens.balance).toBe(100));

    await act(async () => {
      await result.current.generator.generate("pikachu");
    });

    await waitFor(() => expect(result.current.generator.status).toBe("succeeded"));
    expect(result.current.tokens.balance).toBe(90);

    const db = await initDB();
    const stored = await db.getAll(STORE_POKEMONS);
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe("pkmn_25");
    expect(stored[0].rarity).toBe("rare");
  });
});
