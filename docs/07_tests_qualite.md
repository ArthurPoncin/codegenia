# 07 — Tests & Qualité (unitaires, intégration, e2e, a11y, perf)

Ce document décrit la **stratégie qualité** de PokéForge : outils, types de tests, exemples concrets (tokens, génération, revente), accessibilité, performance et CI/CD. L’objectif est de **prévenir les régressions** tout en gardant un **cycle de dev rapide**.

---

## 🧰 Outils

- **Unitaires & intégration (front)** : Jest + React Testing Library
- **Mock API** : [MSW](https://mswjs.io/) (Mock Service Worker) pour tests unitaires/intégration
- **DB locale** : [fake-indexeddb](https://github.com/dumbmatter/fakeIndexedDB) pour mock IndexedDB
- **E2E** : Playwright (ou Cypress)
- **A11y** : @axe-core/react (ou jest-axe)
- **Perf** : Lighthouse CI (pages clés), Web Vitals (en prod)
- **Lint** : ESLint + Prettier

### Installation (exemple)
```bash
npm install -D jest @testing-library/react @testing-library/jest-dom @testing-library/user-event \
  msw whatwg-fetch \
  jest-environment-jsdom \
  fake-indexeddb \
  @axe-core/react jest-axe \
  @playwright/test \
  lighthouse lighthouse-ci
```

---

## 🧪 Pyramide de tests (cible)

- **Lint / Type checks** (rapides) → chaque commit/PR
- **Unitaires** (fonctions pures, hooks isolés) → large couverture
- **Intégration** (composants + hooks + MSW) → cas métiers
- **E2E** (scénarios utilisateur clés) → faible nombre mais critiques
- **A11y / Perf** → seuils automatiques en CI

---

## 🔍 Tests unitaires

### 1) Fonctions pures (utils)
- Génération d’IDs, formatage de dates, mapping de rareté, validations.

Exemple (pseudo) :
```js
import { clampBalance } from "@/lib/utils";

test("clampBalance never returns negative", () => {
  expect(clampBalance(-10)).toBe(0);
});
```

### 2) IndexedDB helpers (mock avec fake‑indexeddb)
```js
import "fake-indexeddb/auto";
import { initDB, STORE_TOKENS, STORE_POKEMONS } from "@/db/indexedDB";
import { ensureInitialTokens, getBalance, setBalance } from "@/db/tokens";

test("initial tokens is 100 for first run", async () => {
  const db = await initDB();
  const bal = await ensureInitialTokens(db);
  expect(bal).toBe(100);
  expect(await getBalance(db)).toBe(100);
});

test("setBalance updates tokens store", async () => {
  const db = await initDB();
  await setBalance(db, 42);
  expect(await getBalance(db)).toBe(42);
});
```

### 3) Hooks isolés (Jest + RTL)
- Mock API avec MSW.
- Vérifier transitions d’état : `idle → queued → running → succeeded|failed`.

```js
import { rest } from "msw";
import { setupServer } from "msw/node";
import { renderHook, act } from "@testing-library/react";
import { useGeneratePokemon } from "@/features/pokemons/useGeneratePokemon";
import client from "@/api/client";

const server = setupServer(
  rest.post("https://api.pokeforge.example.com/v1/generate", (req, res, ctx) => {
    return res(ctx.status(202), ctx.json({ jobId: "job_1", chargeApplied: true }));
  }),
  rest.get("https://api.pokeforge.example.com/v1/generate/job_1", (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ status: "succeeded", image: { id: "img_1", url: "#" } }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test("generate flow succeeds", async () => {
  const { result } = renderHook(() => useGeneratePokemon({ mode: "server" }));
  await act(async () => { await result.current.generate("Prompt"); });
  expect(result.current.status).toBe("succeeded");
});
```

---

## 🧩 Tests d’intégration (composants + hooks + MSW)

- Rendre la page **Home** avec `TokensProvider` + `GeneratorButton` + `PokemonGrid`.
- Scénarios :
  - **Affichage du solde** (mock `/tokens/balance`).
  - **Click Générer** → requête `/generate` → polling → insertion en collection.
  - **Échec génération** → message d’erreur + solde inchangé ou remboursé (selon politique).

```jsx
import { render, screen } from "@testing-library/react";
import user from "@testing-library/user-event";
import Home from "@/pages/Home";
import { TokensProvider } from "@/features/tokens/useTokens";

test("home shows balance and allows generation", async () => {
  render(<TokensProvider mode="server"><Home /></TokensProvider>);
  await screen.findByText(/jetons/i);
  await user.click(screen.getByRole("button", { name: /générer/i }));
  // Assert loading state then a new card appears
});
```

---

## 🎭 Tests E2E (Playwright)

Couvrir **3** parcours critiques :

1) **Premier lancement** → solde 100 visible  
2) **Génération réussie** → −10 jetons, carte apparaît  
3) **Revente** → +5 jetons, carte disparaît

Setup minimal `playwright.config.ts` :
```ts
import { defineConfig } from "@playwright/test";
export default defineConfig({
  use: { baseURL: "http://localhost:5173", headless: true },
  testDir: "./e2e",
});
```

Exemple `e2e/flow.spec.ts` :
```ts
import { test, expect } from "@playwright/test";

test("first run shows 100 tokens", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText(/100/i)).toBeVisible();
});

test("generation reduces tokens and shows card", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /générer/i }).click();
  await expect(page.getByText(/génération en cours/i)).toBeVisible();
  // Attendre la carte (mock réseau côté dev-server ou stub deterministic)
  await expect(page.locator("article").first()).toBeVisible();
});

test("selling refunds +5", async ({ page }) => {
  await page.goto("/collection");
  // clic sur "Revendre (+5)" sur la première carte
  const firstSell = page.getByRole("button", { name: /revendre/i }).first();
  if (await firstSell.isVisible()) {
    const balanceBefore = await page.getByText(/\d+\s*jetons/).textContent();
    await firstSell.click();
    // Vérifier le nouveau solde > balanceBefore
  }
});
```

> Pour des E2E stables, **intercepter/figer** les réponses réseau (fixtures) ou utiliser un **mock server** en local.

---

## ♿ Accessibilité (a11y)

### Règles clés
- Contraste suffisant, focus visible, `aria-label` sur icônes.
- Navigation clavier complète (modales, toasts).
- Texte alternatif pour images (nom du Pokémon).

### Tests automatiques
```js
import React from "react";
import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import Home from "@/pages/Home";

expect.extend(toHaveNoViolations);

test("home a11y", async () => {
  const { container } = render(<Home />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

---

## ⚡ Performance

### Budgets
- JS initial < **200 kB** (gzip) hors images
- LCP < **2.5 s**, TTI < **3.5 s** sur mobile 4x CPU slow-down
- Images ≤ **512×512** et < **1 Mo**

### Lighthouse CI (exemple `lighthouserc.json`)
```json
{
  "ci": {
    "collect": {
      "url": ["http://localhost:4173/"],
      "startServerCommand": "npm run preview",
      "numberOfRuns": 2
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["warn", { "minScore": 0.9 }]
      }
    }
  }
}
```

---

## 🧹 Lint & hooks de commit

- **ESLint** : `npm run lint` (CI bloquante)  
- **Prettier** : `npm run format`  
- **Husky** (optionnel) : pre-commit `lint-staged`

```bash
npm install -D husky lint-staged
npx husky init
```

`.husky/pre-commit` :
```bash
#!/usr/bin/env sh
npx lint-staged
```

`package.json` :
```json
{
  "lint-staged": {
    "*.{js,jsx,css,md}": ["prettier --write", "eslint --fix"]
  }
}
```

---

## 📊 Couverture & seuils

`package.json` (Jest) :
```json
{
  "jest": {
    "testEnvironment": "jsdom",
    "setupFiles": ["whatwg-fetch"],
    "collectCoverage": true,
    "collectCoverageFrom": ["src/**/*.{js,jsx}"],
    "coverageThreshold": {
      "global": { "branches": 60, "functions": 70, "lines": 75, "statements": 75 }
    }
  }
}
```

> Ajuster progressivement les seuils en fonction de la maturité du projet.

---

## 🤖 CI GitHub Actions (exemple)

`.github/workflows/ci.yml` :
```yaml
name: CI
on: [push, pull_request]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"
      - run: npm ci
      - run: npm run lint
      - run: npm test -- --ci --runInBand
      - run: npm run build
```

> Pour Playwright : ajouter `npx playwright install --with-deps` + job e2e séparé.

---

## ✅ Checklist qualité

- [ ] Lint & format passent localement et en CI.  
- [ ] Unitaires : utils, hooks (idempotence, transitions).  
- [ ] Intégration : pages avec MSW (génération, revente).  
- [ ] E2E : 3 parcours critiques couverts.  
- [ ] A11y : axe sans violations bloquantes.  
- [ ] Perf : budgets respectés + Lighthouse CI > 0.90.  
- [ ] Couverture ≥ 75% (progression continue).  
- [ ] CI fiable et rapide (< 5–8 min selon scope).

---

## 🔗 Références internes

- `05_logic_metier.md` — scénarios et critères d’acceptation.  
- `06_integration_frontend.md` — wiring des hooks/pages.  
- `08_deploiement.md` — build, hosting, et exécution des checks en CI.
