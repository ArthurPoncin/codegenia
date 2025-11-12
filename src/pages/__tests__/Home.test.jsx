import "fake-indexeddb/auto";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Home from "@/pages/Home.jsx";
import { TokensProvider } from "@/features/tokens/useTokens.js";
import { initDB, STORE_POKEMONS } from "@/db/indexedDB.js";
import { axe } from "jest-axe";

const API_URL = "https://api.pokeforge.test";

const server = setupServer(
  rest.get(`${API_URL}/tokens/balance`, (req, res, ctx) => {
    return res(ctx.json({ balance: 100 }));
  }),
  rest.get(`${API_URL}/inventory`, (req, res, ctx) => {
    return res(ctx.json({ items: [] }));
  }),
  rest.post(`${API_URL}/generate`, async (req, res, ctx) => {
    const body = await req.json();
    return res(
      ctx.status(202),
      ctx.json({ jobId: "job_home", status: "queued", chargeApplied: true, balance: 90, prompt: body.prompt })
    );
  }),
  rest.get(`${API_URL}/generate/job_home`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        jobId: "job_home",
        status: "succeeded",
        image: { id: "img_home", url: "https://cdn.test/img_home.png" },
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
    await user.type(textarea, "Pokémon de test");
    await user.click(screen.getByRole("button", { name: /Générer/i }));

    await waitFor(async () => {
      const db = await initDB();
      const stored = await db.getAll(STORE_POKEMONS);
      expect(stored.some((item) => item.id === "img_home")).toBe(true);
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
