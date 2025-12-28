import "fake-indexeddb/auto";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Home from "@/pages/Home.jsx";
import { TokensProvider } from "@/features/tokens/useTokens.js";
import { initDB, STORE_POKEMONS } from "@/db/indexedDB.js";
import { axe } from "jest-axe";

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

describe("Home page", () => {
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

  it("renders and allows generating a pokemon", async () => {
    const user = userEvent.setup();
    render(
      <TokensProvider>
        <Home />
      </TokensProvider>
    );

    await waitFor(() => expect(screen.getByText(/Bienvenue sur PokéForge/i)).toBeInTheDocument());

    const textarea = screen.getByLabelText(/Décris ton Pokémon/i);
    await user.clear(textarea);
    await user.type(textarea, "pikachu");
    await user.click(screen.getByRole("button", { name: /Générer/i }));

    await waitFor(async () => {
      const db = await initDB();
      const stored = await db.getAll(STORE_POKEMONS);
      expect(stored.some((item) => item.id === "pkmn_25")).toBe(true);
    });
  });

  it("has no critical accessibility violations", async () => {
    const { container } = render(
      <TokensProvider>
        <Home />
      </TokensProvider>
    );

    await waitFor(() => expect(screen.getByText(/Bienvenue sur PokéForge/i)).toBeInTheDocument());
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
