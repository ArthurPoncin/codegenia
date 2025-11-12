# 03 — IndexedDB : schéma, opérations CRUD, transactions & migrations

Ce document définit **le modèle de données local** pour PokéForge, la **gestion des jetons** (100 init, −10 génération, +5 revente), les **opérations CRUD** pour les Pokémon, les **transactions**, les **migrations** de version, ainsi que les stratégies de **résilience** (quotas, corruption, export).  
Implémentation recommandée via la lib [`idb`](https://www.npmjs.com/package/idb).

---

## 🎯 Objectifs fonctionnels

- Persister **hors‑ligne** : Pokémon générés (image, métadonnées) + solde de jetons.
- Garantir la **cohérence** des jetons lors des opérations (génération/revente).
- Permettre **migrations** de schéma sans perte de données.
- Fournir des **APIs utilitaires** simples pour le front (hooks/services).

---

## 🧱 Schéma & stores

**Base** : `pokeforge-db`  
**Version** : `1` (augmentera lors des migrations)

### Stores
1. **`tokens`** — *clé primaire `id` (string)*  
   - `id`: `"userTokens"` (clé fixe)  
   - `balance`: `number` (solde courant)  
   - `updatedAt`: `number` (epoch ms)

2. **`pokemons`** — *clé primaire `id` (string)*  
   - `id`: `"pkmn-<nanoid>"`  
   - `name`: `string`  
   - `imageUrl`: `string` (URL blob/remote)  
   - `prompt`: `string` (texte utilisé pour générer)  
   - `rarity`: `"common" | "rare" | "epic" | "legendary"` (optionnel)  
   - `createdAt`: `number` (epoch ms)  
   - `updatedAt`: `number` (epoch ms)  
   - `source`: `"local" | "remote"` (optionnel)  
   - `hash`: `string` (optionnel; contrôle doublons)  

### Index recommandés (évolutions futures)
- `pokemons_by_createdAt` (desc) — tri rapide par date
- `pokemons_by_rarity` — filtrage collection
- `pokemons_by_hash` — détection doublon

> Les index ci‑dessus pourront être ajoutés dans une **migration** (v2+).

---

## 🧩 Initialisation

`src/db/indexedDB.js`

```js
import { openDB } from "idb";

export const DB_NAME = "pokeforge-db";
export const DB_VERSION = 1;
export const STORE_TOKENS = "tokens";
export const STORE_POKEMONS = "pokemons";

export async function initDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, tx) {
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

> L’écriture `upgrade(...)` est le point d’entrée des **migrations** : ajouter des objStores, index, champs, etc.

---

## 💰 Gestion des jetons (règles métier)

- **Crédit initial** : 100 jetons à la **première connexion** (si aucun document `userTokens` n’existe).  
- **Génération** : −10 jetons **atomiquement** avec l’ajout du Pokémon.  
- **Revente** : +5 jetons **atomiquement** avec la suppression du Pokémon.

Ces changements doivent être **transactionnels** pour éviter les incohérences en cas d’erreur.

---

## 🔧 Helpers CRUD & transactions

`src/db/tokens.js`

```js
import { STORE_TOKENS } from "./indexedDB";

export async function ensureInitialTokens(db) {
  const existing = await db.get(STORE_TOKENS, "userTokens");
  if (!existing) {
    await db.put(STORE_TOKENS, {
      id: "userTokens",
      balance: 100,
      updatedAt: Date.now(),
    });
    return 100;
  }
  return existing.balance;
}

export async function getBalance(db) {
  const doc = await db.get(STORE_TOKENS, "userTokens");
  return doc?.balance ?? 0;
}

export async function setBalance(db, balance) {
  await db.put(STORE_TOKENS, {
    id: "userTokens",
    balance,
    updatedAt: Date.now(),
  });
  return balance;
}
```

`src/db/pokemons.js`

```js
import { STORE_POKEMONS } from "./indexedDB";

export async function listPokemons(db, { limit = 50, offset = 0 } = {}) {
  const all = await db.getAll(STORE_POKEMONS);
  // Tri récents → anciens (si createdAt existe)
  all.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  return all.slice(offset, offset + limit);
}

export async function getPokemon(db, id) {
  return db.get(STORE_POKEMONS, id);
}

export async function putPokemon(db, pkmn) {
  const doc = {
    ...pkmn,
    updatedAt: Date.now(),
    createdAt: pkmn.createdAt ?? Date.now(),
  };
  await db.put(STORE_POKEMONS, doc);
  return doc;
}

export async function deletePokemon(db, id) {
  await db.delete(STORE_POKEMONS, id);
}
```

### Opérations **atomiques** (transactions)
`src/db/ops.js`

```js
import { STORE_POKEMONS, STORE_TOKENS } from "./indexedDB";

/**
 * Génère un Pokémon: décrémenter tokens (-10) + créer entrée pokemons.
 * Opération atomique via transaction R/W sur les deux stores.
 */
export async function txGeneratePokemon(db, pokemonDoc) {
  return db.transaction([STORE_TOKENS, STORE_POKEMONS], "readwrite", {
    durability: "relaxed",
  }).objectStore(STORE_TOKENS).get("userTokens").then(async (tokens) => {
    const balance = tokens?.balance ?? 0;
    if (balance < 10) {
      throw new Error("INSUFFICIENT_TOKENS");
    }
    tokens.balance = balance - 10;
    tokens.updatedAt = Date.now();

    // Pour écrire dans STORE_TOKENS via la transaction existante:
    const tx = db.transaction([STORE_TOKENS, STORE_POKEMONS], "readwrite");
    await tx.store.put(tokens); // tokens
    await tx.db.put(STORE_POKEMONS, {
      ...pokemonDoc,
      createdAt: pokemonDoc.createdAt ?? Date.now(),
      updatedAt: Date.now(),
    });
    await tx.done;

    return { newBalance: tokens.balance };
  });
}

/**
 * Revendre un Pokémon: supprimer entrée pokemons + rembourser +5.
 */
export async function txSellPokemon(db, pokemonId) {
  const tx = db.transaction([STORE_TOKENS, STORE_POKEMONS], "readwrite");
  const tokens = await tx.db.get(STORE_TOKENS, "userTokens");
  const balance = tokens?.balance ?? 0;

  // Delete then refund
  await tx.db.delete(STORE_POKEMONS, pokemonId);
  tokens.balance = balance + 5;
  tokens.updatedAt = Date.now();
  await tx.db.put(STORE_TOKENS, tokens);

  await tx.done;
  return { newBalance: tokens.balance };
}
```

> Selon la version de `idb`, l’accès dans une même transaction peut se faire via `tx.objectStore(name)` ou `tx.db.get/put`. Garde une **API cohérente** dans ton projet (choisis l’un des styles et applique‑le partout).

---

## 🧪 Validation des données

Avant insertion :
- **Champs obligatoires** pour `pokemons` : `id`, `name`, `imageUrl`.  
- **Tailles** : limiter longueur de `name`/`prompt`.  
- **URL** : `imageUrl` doit être un URL ou un `blob:` valide.  
- **Rareté** : chaîne dans l’ensemble autorisé.

Crée un utilitaire `lib/validators.js` pour centraliser.

---

## 🧱 Migrations de schéma

Quand le schéma évolue, incrémenter `DB_VERSION` et ajouter la logique dans `upgrade(...)` :

Ex. **v2** — ajout des index `createdAt`, `rarity` :
```js
export const DB_VERSION = 2;

export async function initDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      if (oldVersion < 2) {
        const store = db.transaction.objectStore("pokemons") || db.createObjectStore("pokemons", { keyPath: "id" });
        // Créer index si store existe déjà
        const pokemons = db.objectStoreNames.contains("pokemons")
          ? db.transaction.objectStore("pokemons")
          : db.createObjectStore("pokemons", { keyPath: "id" });

        if (!pokemons.indexNames.contains("by_createdAt")) {
          pokemons.createIndex("by_createdAt", "createdAt");
        }
        if (!pokemons.indexNames.contains("by_rarity")) {
          pokemons.createIndex("by_rarity", "rarity");
        }
      }
    },
  });
}
```

> **Stratégie** : migrations **idempotentes**, *feature‑flag* pour activer les nouvelles requêtes seulement si l’index existe.

---

## 🛡️ Résilience & quotas

- **QuotaExceededError** : capturer l’erreur, alerter l’utilisateur, proposer **purge** sélective (anciens Pokémon).  
- **Images volumineuses** : préférer des **URLs distantes** ou blobs compressés, et un **cache HTTP** côté CDN.  
- **Corruption** (rare) : offrir un bouton *“Réinitialiser la base locale”* (supprimer et recréer la DB).

Purge utilitaire :
```js
export async function purgeOldPokemons(db, keepLast = 100) {
  const all = await db.getAll("pokemons");
  all.sort((a,b) => (b.createdAt || 0) - (a.createdAt || 0));
  const toDelete = all.slice(keepLast);
  const tx = db.transaction("pokemons", "readwrite");
  for (const p of toDelete) await tx.store.delete(p.id);
  await tx.done;
  return toDelete.length;
}
```

---

## 🔄 Export / Import

### Export JSON
```js
export async function exportDB(db) {
  const [tokens, pokemons] = await Promise.all([
    db.get("tokens", "userTokens"),
    db.getAll("pokemons"),
  ]);
  return JSON.stringify({ tokens, pokemons }, null, 2);
}
```

### Import (merge sécurisé)
```js
export async function importDB(db, json) {
  const data = typeof json === "string" ? JSON.parse(json) : json;
  const tx = db.transaction(["tokens", "pokemons"], "readwrite");
  if (data.tokens) await tx.db.put("tokens", data.tokens);
  if (Array.isArray(data.pokemons)) {
    for (const p of data.pokemons) await tx.db.put("pokemons", p);
  }
  await tx.done;
}
```

---

## 🔐 Permissions & sécurité

- IndexedDB ne requiert pas de permission explicite, mais dépend du **contexte sécurisé** (`https://` ou `localhost`).  
- Éviter d’enregistrer des **clés API** dans IndexedDB. Utiliser `import.meta.env` pour les secrets côté client (limités).  
- Sanitize des champs strings si réaffichés dans le DOM.

---

## 🧪 Tests (mocks et e2e)

- **Unitaires** : mock de `idb` (ex. *fake‑idb*) pour tester les helpers.  
- **E2E** : tests Playwright/Cypress qui valident le flux (init 100 → génère −10 → revend +5).

Ex. scénario Jest pseudo‑code :
```js
test("token flow", async () => {
  const db = await initDB();
  await ensureInitialTokens(db);                 // 100
  await txGeneratePokemon(db, { id:"pkmn-1", name:"A", imageUrl:"#"});
  expect(await getBalance(db)).toBe(90);
  await txSellPokemon(db, "pkmn-1");
  expect(await getBalance(db)).toBe(95);
});
```

---

## ✅ Checklist IndexedDB

- [ ] Stores `tokens` & `pokemons` créés.  
- [ ] `ensureInitialTokens()` crédite 100 si absent.  
- [ ] Transactions atomiques pour génération (−10) & revente (+5).  
- [ ] CRUD utilitaires (`list/get/put/delete`).  
- [ ] Migration prête (pattern `upgrade` + versioning).  
- [ ] Stratégies d’erreurs (quota, purge, reset).  
- [ ] Export/Import JSON.  
- [ ] Tests unitaires & e2e couvrant les cas métiers.

---

## 🔗 Références internes

- `01_structure_projet.md` — config Vite/Tailwind, arborescence.  
- `02_design_application.md` — composants UI & UX.  
- `04_api_endpoints.md` — contrats API à synchroniser avec le stockage (prompts, images).  
- `05_logic_metier.md` — règles métiers : −10 génération, +5 revente.  
- `06_integration_frontend.md` — hooks consommateurs des helpers ci‑dessus.
