# 🧬 PokéForge — Générateur de Pokémon IA

**PokéForge** est une application React moderne qui permet de **générer, collectionner et échanger des Pokémon créés par intelligence artificielle**.  
Chaque Pokémon est généré via une API *text-to-image* et sauvegardé localement dans le navigateur grâce à **IndexedDB**.

---

## ⚙️ Fonctionnalités principales

- **🎨 Génération IA** : Crée un Pokémon unique à chaque run à partir d’un prompt texte.
- **💾 Stockage local** : Les Pokémon et le solde de jetons sont enregistrés dans **IndexedDB**, garantissant la persistance même après rechargement ou hors ligne.
- **💰 Économie interne** :  
  - L’utilisateur commence avec **100 jetons**.  
  - Générer un Pokémon coûte **10 jetons**.  
  - Revendre un Pokémon rembourse **5 jetons**.
- **⚡ Interface rapide et moderne** : Construite avec **React + Vite**.

---

## 🧩 Stack technique

- **Framework** : [React](https://react.dev/)
- **Build Tool** : [Vite](https://vitejs.dev/)
- **Base de données locale** : [IndexedDB](https://developer.mozilla.org/fr/docs/Web/API/IndexedDB_API)  
  (via l’API native ou la librairie [idb](https://www.npmjs.com/package/idb))
- **API IA** : Service *text-to-image* (Stable Diffusion, Replicate, OpenAI, etc.)
- **Langage** : JavaScript / TypeScript

---

## 🚀 Installation

```bash
# 1. Cloner le projet
git clone https://github.com/ton-compte/pokeforge.git
cd pokeforge

# 2. Installer les dépendances
npm install

# 3. Lancer le serveur de développement
npm run dev
```

Application disponible sur :  
👉 [http://localhost:5173](http://localhost:5173)

---

## 🗂️ Structure du projet

```
src/
 ├── api/
 │    └── imageGenerator.js     # Appels à l'API text-to-image
 ├── db/
 │    └── indexedDB.js          # Gestion de la base locale
 ├── components/
 │    ├── PokemonCard.jsx       # Affiche un Pokémon
 │    ├── TokenCounter.jsx      # Gère et affiche les jetons
 │    └── GeneratorButton.jsx   # Bouton de génération IA
 ├── App.jsx
 ├── main.jsx
 └── styles/
      └── index.css
```

---

## 💰 Système de jetons

| Action                  | Jetons | Description |
|--------------------------|--------|--------------|
| Première connexion       | +100   | Crédit initial |
| Génération d’un Pokémon  | -10    | Appel à l’API IA |
| Revente d’un Pokémon     | +5     | Suppression d’un Pokémon d’IndexedDB |

Le solde est mis à jour et persiste grâce à IndexedDB.

---

## 🧱 Structure IndexedDB

La base locale contient deux **stores** principaux :

```js
// Exemple de schéma IndexedDB
pokeforge-db
 ├── store: "tokens"
 │     └── { id: "userTokens", balance: 100 }
 └── store: "pokemons"
       ├── { id: "pkmn-1", name: "Flamoghost", imageUrl: "...", createdAt: "..." }
       ├── { id: "pkmn-2", name: "Aquadrill",  imageUrl: "...", createdAt: "..." }
       └── ...
```

### Exemple d’initialisation (`db/indexedDB.js`)
```js
import { openDB } from "idb";

export const initDB = async () => {
  return openDB("pokeforge-db", 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("pokemons")) {
        db.createObjectStore("pokemons", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("tokens")) {
        db.createObjectStore("tokens", { keyPath: "id" });
      }
    },
  });
};
```

### Exemple de gestion des jetons
```js
export const getTokens = async (db) => {
  return (await db.get("tokens", "userTokens"))?.balance ?? 100;
};

export const updateTokens = async (db, newBalance) => {
  await db.put("tokens", { id: "userTokens", balance: newBalance });
};
```

---

## 🔮 Améliorations possibles

- Système de **rareté** et **classement** des Pokémon
- **Historique** de génération avec miniatures
- **Échange entre utilisateurs** (P2P)
- Connexion via **portefeuille Web3** pour authentification

---

## 🧑‍💻 Licence

Projet open source sous licence **MIT**.  
Fais-en bon usage, dresseur·se.

---

> *“Attrape-les tous, mais avec des jetons.”* 💫
