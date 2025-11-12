# 06 — Intégration Frontend (React + Vite + Tailwind)

Ce document relie **API**, **IndexedDB**, **hooks React**, **pages** et **composants** pour réaliser un flux complet :  
initialisation des jetons → génération IA (−10) → insertion en collection → revente (+5).

---

## 🧭 Vue d’ensemble

- **Hooks clés**
  - `useTokens()` — lecture/refresh du solde, init 100 si besoin.
  - `useGeneratePokemon()` — déclenchement génération (idempotence + polling).
  - `useInventory()` — lecture/ajout/suppression de Pokémon (via API ou IndexedDB).
  - `useSellPokemon()` — revente atomique (+5) + suppression inventaire.
- **Context**
  - `TokensProvider` — expose `balance`, `setBalance`, `refresh` au reste de l’app.
- **Pages**
  - `Home` — CTA Générer + dernières cartes.
  - `Collection` — grille, tri/filtre, actions.
  - `Settings` — thème, reset DB, export/import.
- **Erreurs & feedback**
  - Toasts (succès/échec), loaders, boutons disabled, focus visible.

---

## 🔌 Câblage des services

### Client API — `src/api/client.js` (rappel)
```js
import axios from "axios";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 20000,
  headers: { "Content-Type": "application/json" },
});

client.interceptors.request.use((config) => {
  const apiKey = import.meta.env.VITE_API_KEY;
  if (apiKey) config.headers.Authorization = `Bearer ${apiKey}`;
  return config;
});

export default client;
```

### DB locale — `src/db/indexedDB.js` (rappel)
```js
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
```

---

## 🧰 Hooks

### `useTokens.js`
```jsx
import { useEffect, useState, useCallback, createContext, useContext } from "react";
import client from "@/api/client";
import { initDB } from "@/db/indexedDB";
import { ensureInitialTokens, getBalance, setBalance } from "@/db/tokens";

const TokensContext = createContext(null);

export function TokensProvider({ children, mode = "server" /* "server" | "offline" */ }) {
  const [balance, setBal] = useState(null);

  const refresh = useCallback(async () => {
    if (mode === "server") {
      const { data } = await client.get("/tokens/balance");
      setBal(data.balance);
    } else {
      const db = await initDB();
      await ensureInitialTokens(db);
      setBal(await getBalance(db));
    }
  }, [mode]);

  useEffect(() => { refresh(); }, [refresh]);

  // Option pour MAJ optimiste
  const mutate = (delta) => setBal((b) => (b ?? 0) + delta);

  return (
    <TokensContext.Provider value={{ balance, refresh, mutate, setBalance: setBal }}>
      {children}
    </TokensContext.Provider>
  );
}

export function useTokens() {
  const ctx = useContext(TokensContext);
  if (!ctx) throw new Error("useTokens must be used within TokensProvider");
  return ctx;
}
```

### `useInventory.js`
```jsx
import { useEffect, useState, useCallback } from "react";
import client from "@/api/client";
import { initDB, STORE_POKEMONS } from "@/db/indexedDB";

export function useInventory({ mode = "server" } = {}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const list = useCallback(async () => {
    setLoading(true);
    try {
      if (mode === "server") {
        const { data } = await client.get("/inventory?limit=200");
        setItems(data.items ?? []);
      } else {
        const db = await initDB();
        const all = await db.getAll(STORE_POKEMONS);
        all.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setItems(all);
      }
    } finally {
      setLoading(false);
    }
  }, [mode]);

  const addLocal = async (doc) => {
    const db = await initDB();
    await db.put(STORE_POKEMONS, { ...doc, createdAt: doc.createdAt ?? Date.now() });
    await list();
  };

  const removeLocal = async (id) => {
    const db = await initDB();
    await db.delete(STORE_POKEMONS, id);
    await list();
  };

  useEffect(() => { list(); }, [list]);

  return { items, loading, list, addLocal, removeLocal };
}
```

### `useGeneratePokemon.js`
```jsx
import { useState } from "react";
import client from "@/api/client";
import { useTokens } from "@/features/tokens/useTokens";
import { useInventory } from "@/features/pokemons/useInventory";

export function useGeneratePokemon({ mode = "server" } = {}) {
  const [status, setStatus] = useState("idle");
  const { mutate, refresh } = useTokens();
  const { addLocal } = useInventory({ mode });

  async function poll(jobId, { interval = 1200, max = 30 } = {}) {
    for (let i = 0; i < max; i++) {
      const { data } = await client.get(`/generate/${jobId}`);
      if (data.status === "succeeded") return data;
      if (data.status === "failed" || data.status === "canceled") throw new Error(data.status);
      await new Promise((r) => setTimeout(r, interval));
    }
    throw new Error("TIMEOUT");
  }

  const generate = async (prompt) => {
    setStatus("queued");
    const key = crypto.randomUUID();
    try {
      if (mode === "server") {
        const { data } = await client.post("/generate", { prompt }, {
          headers: { "Idempotency-Key": key },
        });
        // Débit effectué côté serveur; MAJ optimiste facultative :
        if (data.chargeApplied) mutate(-10);

        setStatus("running");
        const done = await poll(data.jobId);
        setStatus("succeeded");

        // Insérer en collection (selon votre politique API)
        await addLocal({
          id: `pkmn_${done.image.id}`,
          name: prompt.slice(0, 24) || "Pokémon",
          imageUrl: done.image.url,
          createdAt: Date.now(),
        });

        await refresh(); // récup solde serveur précis
      } else {
        // Mode offline-first: exemple minimal (vérifs détaillées dans 03/05)
        // Ici vous appelleriez un provider local ou mock pour générer une image
        mutate(-10);
        setStatus("running");
        const img = { id: crypto.randomUUID(), url: "#", width: 512, height: 512 };
        await addLocal({
          id: `pkmn_${img.id}`,
          name: prompt.slice(0, 24) || "Pokémon",
          imageUrl: img.url,
          createdAt: Date.now(),
        });
        setStatus("succeeded");
      }
    } catch (e) {
      setStatus("failed");
      // En mode serveur, si le backend fait un refund auto en cas de fail, rafraîchir :
      await refresh();
      throw e;
    }
  };

  return { status, generate };
}
```

### `useSellPokemon.js`
```jsx
import client from "@/api/client";
import { useTokens } from "@/features/tokens/useTokens";
import { useInventory } from "@/features/pokemons/useInventory";

export function useSellPokemon({ mode = "server" } = {}) {
  const { refresh, mutate } = useTokens();
  const { removeLocal } = useInventory({ mode });

  return async (pokemonId) => {
    if (mode === "server") {
      const { data } = await client.post("/sell", { pokemonId });
      await removeLocal(pokemonId);    // garder le cache local aligné
      await refresh();                 // solde précis serveur
      return data.balance;
    } else {
      // Offline: +5 et suppression locale
      mutate(+5);
      await removeLocal(pokemonId);
      return null;
    }
  };
}
```

---

## 🧩 Composants & pages

### `components/domain/GeneratorButton.jsx`
```jsx
import Button from "@/components/ui/Button";
import { useGeneratePokemon } from "@/features/pokemons/useGeneratePokemon";

export default function GeneratorButton() {
  const { status, generate } = useGeneratePokemon({ mode: "server" });

  const busy = status === "queued" || status === "running";
  return (
    <Button
      onClick={() => generate("A new electric fox-like Pokémon")}
      disabled={busy}
      aria-busy={busy}
    >
      {busy ? "Génération en cours…" : "Générer (−10)"}
    </Button>
  );
}
```

### `components/domain/PokemonGrid.jsx`
```jsx
import PokemonCard from "@/components/domain/PokemonCard";
import { useInventory } from "@/features/pokemons/useInventory";
import { useSellPokemon } from "@/features/pokemons/useSellPokemon";

export default function PokemonGrid() {
  const { items, loading } = useInventory({ mode: "server" });
  const sell = useSellPokemon({ mode: "server" });

  if (loading) return <div className="animate-pulse h-24" />;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((p) => (
        <PokemonCard
          key={p.id}
          name={p.name}
          imageUrl={p.image?.url || p.imageUrl}
          createdAt={p.createdAt}
          rarity={p.rarity}
          onSell={() => sell(p.id)}
        />
      ))}
    </div>
  );
}
```

### `pages/Home.jsx`
```jsx
import GeneratorButton from "@/components/domain/GeneratorButton";
import PokemonGrid from "@/components/domain/PokemonGrid";
import TokenCounter from "@/components/domain/TokenCounter";
import { useTokens } from "@/features/tokens/useTokens";

export default function Home() {
  const { balance } = useTokens();

  return (
    <section className="section">
      <header className="mb-6 flex items-center gap-4">
        <h2 className="text-xl font-bold">Bienvenue sur PokéForge</h2>
        <div className="ml-auto"><TokenCounter value={balance ?? 0} /></div>
      </header>

      <div className="mb-8">
        <GeneratorButton />
        <p className="text-sm text-brand-gray mt-2">
          100 jetons au départ · −10 par génération · +5 à la revente
        </p>
      </div>

      <PokemonGrid />
    </section>
  );
}
```

### `pages/Collection.jsx`
```jsx
import PokemonGrid from "@/components/domain/PokemonGrid";

export default function Collection() {
  return (
    <section className="section">
      <h2 className="text-xl font-bold mb-4">Votre collection</h2>
      <PokemonGrid />
    </section>
  );
}
```

### `pages/Settings.jsx`
```jsx
import { initDB, DB_NAME } from "@/db/indexedDB";

export default function Settings() {
  const resetDB = async () => {
    if (!confirm("Réinitialiser la base locale ?")) return;
    indexedDB.deleteDatabase(DB_NAME);
    alert("Base locale réinitialisée. Rechargez la page.");
  };

  const exportDB = async () => {
    const db = await initDB();
    const tokens = await db.get("tokens", "userTokens");
    const pokemons = await db.getAll("pokemons");
    const blob = new Blob([JSON.stringify({ tokens, pokemons }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), { href: url, download: "pokeforge-export.json" });
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="section">
      <h2 className="text-xl font-bold mb-4">Paramètres</h2>
      <div className="flex gap-3">
        <button className="px-4 py-2 rounded-xl bg-brand-red text-white" onClick={resetDB}>
          Réinitialiser IndexedDB
        </button>
        <button className="px-4 py-2 rounded-xl bg-brand-blue text-white" onClick={exportDB}>
          Exporter les données
        </button>
      </div>
    </section>
  );
}
```

---

## 🧭 Bootstrapping App

### `src/App.jsx`
```jsx
import { Outlet, Link, NavLink } from "react-router-dom";
import { TokensProvider } from "@/features/tokens/useTokens";
import TokenCounter from "@/components/domain/TokenCounter";

export default function App() {
  return (
    <TokensProvider mode="server">
      <div className="min-h-dvh bg-surface-50 text-brand-black">
        <header className="sticky top-0 z-40 backdrop-blur bg-white/80 border-b border-surface-200">
          <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-6">
            <Link to="/" className="font-bold">PokéForge</Link>
            <NavLink to="/collection" className="text-sm text-brand-blue">Collection</NavLink>
            <NavLink to="/settings" className="text-sm text-brand-blue">Paramètres</NavLink>
            <div className="ml-auto"><TokenCounter value={0} /></div>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">
          <Outlet />
        </main>
        <footer className="border-t border-surface-200 py-6 mt-10 text-sm text-brand-gray">
          <div className="mx-auto max-w-6xl px-4">© PokéForge</div>
        </footer>
      </div>
    </TokensProvider>
  );
}
```

> Pour afficher le solde réel dans le header, consomme `useTokens()` et passe `balance` à `TokenCounter` (ou place le compteur dans `App` avec le hook).

---

## 🧪 Gestion des erreurs & UX

- **Générer** : désactiver bouton pendant `queued/running`; message clair en cas d’échec (`toast`, `aria-live="polite"`).  
- **Revente** : modale de confirmation optionnelle.  
- **Rate‑limit** : si `429`, backoff exponentiel + message “Réessayez plus tard”.  
- **Accessibilité** : focus visible sur CTA, `aria-label`/`alt` corrects.  
- **Idempotence** : stocker la clé dans IndexedDB pour éviter les doubles débits après refresh (optionnel côté front).

---

## ✅ Checklist d’intégration

- [ ] `TokensProvider` instancié au plus haut niveau.  
- [ ] Hooks `useTokens`, `useInventory`, `useGeneratePokemon`, `useSellPokemon` implémentés.  
- [ ] Pages Home/Collection/Settings connectées.  
- [ ] Bouton Générer relié à l’API + idempotence + polling.  
- [ ] Insertion inventaire à la fin de la génération.  
- [ ] Revente supprime item et crédite +5.  
- [ ] UX loading/erreur adaptée + A11y.

---

## 🔗 Références internes

- `02_design_application.md` — composants/UX.  
- `03_indexeddb_schema.md` — persistance locale et transactions.  
- `04_api_endpoints.md` — contrats & erreurs.  
- `05_logic_metier.md` — règles métier.
