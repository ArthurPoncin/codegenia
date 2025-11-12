# 01 — Structure du projet (React + Vite, JavaScript, Tailwind)

Ce document décrit **l’architecture**, les **dépendances** et la **configuration initiale** d’une application React (JavaScript) construite avec **Vite** et **Tailwind CSS**. Il sert de fondation pour tous les autres documents.

---

## 🎯 Objectifs
- Démarrer un projet **React + Vite** en JavaScript (sans TypeScript).
- Mettre en place **Tailwind CSS** pour le design.
- Préparer les **alias de chemin**, la **qualité de code** (ESLint/Prettier) et les **scripts NPM**.
- Structurer le code pour accueillir **IndexedDB**, **API client**, **logique métier** et **tests**.

---

## 📦 Création du projet & dépendances

```bash
# Créer le projet
npm create vite@latest pokeforge -- --template react
cd pokeforge

# Dépendances UI
npm install react-router-dom

# Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Qualité de code
npm install -D eslint prettier eslint-config-prettier eslint-plugin-react eslint-plugin-react-hooks

# IndexedDB (lib utilitaire)
npm install idb

# Outils utiles
npm install axios
```

---

## 🎨 Configuration Tailwind

1) **Configurer les sources** dans `tailwind.config.js` :

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: { extend: {} },
  plugins: [],
};
```

2) **Activer Tailwind** dans `src/styles/index.css` (ou `src/index.css`) :

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Exemples de styles globaux */
:root {
  --app-padding: 16px;
}
body {
  @apply bg-slate-50 text-slate-800 antialiased;
}
```

3) **Importer la feuille de style** dans `src/main.jsx` :

```jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./styles/index.css"; // <- Tailwind

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

## 🗂️ Arborescence recommandée

```
pokeforge/
├─ public/
│  └─ favicon.svg
├─ src/
│  ├─ api/
│  │  ├─ client.js            # axios (baseURL, interceptors)
│  │  └─ imageGenerator.js    # endpoints IA (appel text-to-image)
│  ├─ assets/                 # images statiques, logos
│  ├─ components/
│  │  ├─ ui/                  # composants UI génériques (Button, Modal...)
│  │  ├─ layout/              # Shell, Header, Footer, Sidebar
│  │  └─ domain/              # PokemonCard, TokenCounter, etc.
│  ├─ db/
│  │  └─ indexedDB.js         # init DB, helpers CRUD (idb)
│  ├─ features/
│  │  ├─ tokens/              # logique jetons (hooks, context)
│  │  └─ pokemons/            # logique pokémons (hooks, services)
│  ├─ hooks/                  # hooks réutilisables (useLocalState, useAsync...)
│  ├─ lib/                    # utilitaires purs (formatters, ids, constants)
│  ├─ pages/
│  │  ├─ Home.jsx
│  │  ├─ Collection.jsx
│  │  └─ Settings.jsx
│  ├─ router/
│  │  └─ index.jsx            # React Router config
│  ├─ styles/
│  │  └─ index.css            # Tailwind + styles globaux
│  ├─ App.jsx
│  ├─ main.jsx
│  └─ vite-env.d.ts           # (généré par Vite; ok même en JS)
├─ .env.example
├─ .eslintrc.cjs
├─ .prettierrc.json
├─ index.html
├─ package.json
├─ tailwind.config.js
├─ postcss.config.js
└─ vite.config.js
```

> Les dossiers `features/*` regroupent **logique + UI** propres à un domaine (ex : tokens, pokemons). Les composants ultra-génériques vont dans `components/ui`.

---

## ⚙️ Alias de chemin (Vite)

Active un alias `@` vers `src/` dans `vite.config.js` :

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
```

Utilisation :

```js
import PokemonCard from "@/components/domain/PokemonCard.jsx";
import { initDB } from "@/db/indexedDB.js";
```

---

## 🔧 Qualité de code (ESLint & Prettier)

### `.eslintrc.cjs`
```js
module.exports = {
  env: { browser: true, es2021: true },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "prettier",
  ],
  parserOptions: { ecmaVersion: "latest", sourceType: "module" },
  settings: { react: { version: "detect" } },
  plugins: ["react"],
  rules: {
    "react/prop-types": "off", // on ne force pas PropTypes si on reste simple
    "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
  },
};
```

### `.prettierrc.json`
```json
{
  "singleQuote": false,
  "trailingComma": "es5",
  "tabWidth": 2,
  "semi": true
}
```

### Scripts `package.json`
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint --ext .js,.jsx src",
    "format": "prettier --write ."
  }
}
```

---

## 🔐 Variables d’environnement

Crée un **`.env.example`** à la racine :

```bash
# URL de base de l'API IA
VITE_API_BASE_URL=https://api.example.com

# Clé d'API (NE PAS COMMIT la vraie clé)
VITE_API_KEY=demo-key
```

Ensuite :
- Duplique en `.env.local` (non versionné) pour tes valeurs réelles.
- Accès dans le code via `import.meta.env.VITE_API_BASE_URL`.

---

## 🌐 Client API (axios)

`src/api/client.js` :

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

client.interceptors.response.use(
  (res) => res,
  (err) => {
    // Log centralisé + message user-friendly
    console.error("[API ERROR]", err?.response?.status, err?.message);
    return Promise.reject(err);
  }
);

export default client;
```

---

## 💾 IndexedDB (idb)

`src/db/indexedDB.js` :

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

> La **définition détaillée du schéma** et des opérations CRUD se trouve dans `03_indexeddb_schema.md` (à venir).

---

## 🧭 Routing

`src/router/index.jsx` :

```jsx
import { createBrowserRouter } from "react-router-dom";
import App from "@/App.jsx";
import Home from "@/pages/Home.jsx";
import Collection from "@/pages/Collection.jsx";
import Settings from "@/pages/Settings.jsx";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: "collection", element: <Collection /> },
      { path: "settings", element: <Settings /> },
    ],
  },
]);
```

`src/main.jsx` :

```jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "@/router";
import App from "@/App.jsx";
import "./styles/index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
```

---

## 🧱 Conventions & organisation

- **Composants UI** : classes utilitaires Tailwind (`flex`, `grid`, `gap-*`, `rounded-2xl`, `shadow`, etc.).
- **Composants domain/** : couplés à la logique métier (ex: `PokemonCard.jsx`).
- **Features** : regrouper hooks + composants + services par domaine (`features/tokens`, `features/pokemons`).  
- **Hooks** : préfixe `use*` (ex.: `useTokens`, `useGeneratePokemon`).  
- **Utils** (`lib/`, `utils/`) : fonctions pures, testables (génération d’IDs, formatage).  
- **Imports absolus** via `@` pour éviter les chemins relatifs fragiles.
- **CSS global minimal** : privilégier Tailwind pour la cohérence.

---

## ✅ Checklist d’initialisation

- [ ] Projet créé avec Vite (template React JS).
- [ ] Tailwind configuré (`content`, directives CSS, import global).
- [ ] Alias `@` actif dans `vite.config.js`.
- [ ] ESLint + Prettier installés & configurés.
- [ ] `src/` structuré (api, db, features, components, pages, styles, router).
- [ ] `.env.example` créé (ne pas commiter `.env.local`).
- [ ] `idb` installé et `initDB()` prêt.
- [ ] Scripts `npm run dev/build/lint/format` fonctionnels.

---

## 🔗 Prochaines étapes

- **02_design_application.md** — Design system, palettes, composants UI, layout.
- **03_indexeddb_schema.md** — Schéma, clés, opérations CRUD, stratégies de migration.
- **04_api_endpoints.md** — Contrats des endpoints text-to-image, limites, erreurs.
- **05_logic_metier.md** — Jetons (100 init, -10 génération, +5 revente), règles.
- **06_integration_frontend.md** — Flux de données complet (hooks, vues, états).
- **07_tests_qualite.md** — Tests unitaires, e2e, accessibilité, perf.
- **08_deploiement.md** — Build, hébergement (Vercel/Netlify), CI/CD.
