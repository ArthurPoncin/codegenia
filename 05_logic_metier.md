# 05 — Logique métier (tokens, génération, revente, cohérence)

Ce document formalise la **logique métier** de PokéForge : économie de jetons, états et transitions, règles d’idempotence, contraintes, et garde‑fous. Il sert de référence unique pour le front, l’API et les tests.

---

## 🎯 Objectifs métier

- Créer un flux **prévisible et traçable** pour générer des Pokémon (text‑to‑image).
- Garantir la **cohérence des jetons** : 100 init → −10 génération → +5 revente.
- Résister aux **erreurs réseau**, au **double‑clic** et aux **refreshs**.
- Supporter **offline‑first** (IndexedDB) et **serveur‑autoritaire** (API).

---

## 💰 Économie des jetons

- **Crédit initial** : `100` à la première connexion (si aucun enregistrement de solde n’existe).
- **Génération** : `−10` appliqués **une seule fois** par génération (idempotente).
- **Revente** : `+5` à la suppression réussie du Pokémon de l’inventaire.

**Invariants**  
1. Le solde est **non négatif**.  
2. Une génération **échouée** peut :  
   - soit **ne pas facturer** (si la charge est à l’achèvement),  
   - soit **rembourser automatiquement** (si la charge est au déclenchement).  
   Choisir une stratégie unique par environnement et s’y tenir. Recommandé : **facturation au déclenchement** + **remboursement si échec** (traçable).

---

## 🔁 États & transitions (machine à états)

### États du job de génération
- `idle` → aucun job actif.
- `queued` → accepté mais en file d’attente.
- `running` → traitement en cours.
- `succeeded` → image disponible (URL/ID).
- `failed` → échec (raison incluse).
- `canceled` → annulé par l’utilisateur/système.

### Transitions usuelles
`idle → queued → running → succeeded|failed`  
`queued|running → canceled`

**Règle de facturation** (recommandée)  
- `idle → queued` : appliquer `−10` **idempotent** (même `Idempotency‑Key` = même charge).  
- `failed|canceled` : **remboursement +10** automatique et traçable (éviter l’abus via compteur d’échecs).

---

## 🧾 Idempotence & anti‑doublon

- Toute action **à coût** utilise une `Idempotency‑Key` (UUID) :  
  - Génération : la même clé → **même `jobId`**, **une seule** charge `−10`.  
- UI : désactiver le bouton **Générer** pendant le démarrage et afficher un état *Pending…*.
- En offline‑first, stocker la clé dans IndexedDB avec l’entrée du job (évite le double débit sur rechargement).

```mermaid
flowchart LR
  Click[Click "Générer"] --> CreateKey[Idempotency-Key]
  CreateKey --> Request[POST /generate (−10)]
  Request -->|202 queued| Job[jobId]
  Job --> Poll[GET /generate/{jobId}]
  Poll -->|succeeded| Save[Save in IndexedDB]
  Poll -->|failed| Refund[+10 Refund]
```

---

## 🧩 Règles de revente

- Seule une entité présente dans l’inventaire peut être **revendue**.  
- **Transaction atomique** : suppression inventaire **ET** crédit `+5` doivent réussir ensemble.  
- Idempotence : une revente répétée du même `pokemonId` renvoie une **réponse neutre** (déjà vendu) sans crédit supplémentaire.

**Conflits**  
- `409 CONFLICT` si l’état n’est pas compatible (`job` non terminé, ou Pokémon introuvable localement).

---

## 🧷 Cohérence Offline/Online

Deux modes d’autorité :

1) **Serveur‑autoritaire** (recommandé en prod)  
   - Source de vérité : serveur.  
   - Le **front** affiche le solde depuis `/tokens/balance` et synchronise l’inventaire depuis `/inventory`.  
   - IndexedDB = **cache** (lecture optimiste + réconciliation).

2) **Offline‑first** (démo / fallback)  
   - Source de vérité : IndexedDB.  
   - Les règles (`−10`, `+5`) sont appliquées côté client via transactions locales.  
   - Sync serveur **optionnelle** quand la connectivité revient.

**Réconciliation**  
- À la reconnexion, comparer :  
  - `tokens.balance` local vs serveur.  
  - Liste `pokemons` (par `id`/`hash`).  
- Si divergence, **prioriser le serveur** et journaliser l’écart.

---

## ⚖️ Contraintes & garde‑fous

- **Solde minimal** : bloquer “Générer” si `< 10` jetons.  
- **Taille d’image** : respecter le format/poids max (UX + quotas).  
- **Rate‑limits** : attendre `Retry‑After` + backoff exponentiel.  
- **Anti‑fraude** (serveur) :  
  - compteur d’échecs par fenêtre temporelle,  
  - signatures de webhooks,  
  - hash d’images pour repérer doublons involontaires,  
  - journal d’audit par utilisateur (`events`).

---

## 📚 Modèle d’événements (audit log)

Chaque action significative génère un **événement** :

| Type | Exemple `payload` | Effet sur solde |
|------|--------------------|------------------|
| `tokens.initialized` | `{ balance:100 }` | `+100` |
| `generation.started` | `{ jobId, key }` | `−10` |
| `generation.succeeded` | `{ jobId, imageId }` | `0` |
| `generation.failed` | `{ jobId, reason }` | `+10` *(si charge au start)* |
| `pokemon.inserted` | `{ pokemonId }` | `0` |
| `pokemon.sold` | `{ pokemonId }` | `+5` |

> Sur serveur, ces événements alimentent la traçabilité et la facturation. En local, ils facilitent le **debug** et la **restauration**.

---

## 🧪 Scénarios & critères d’acceptation

### A. Premier lancement
- **Étant donné** un utilisateur sans enregistrement,  
- **Quand** l’app démarre,  
- **Alors** `balance = 100` est visible, et persiste après refresh.

### B. Génération avec succès
- **Étant donné** `balance ≥ 10`,  
- **Quand** je clique **Générer**,  
- **Alors** le solde devient `balance − 10`, un job est créé,  
  à l’issue **succeeded** je vois la carte Pokémon en collection.

### C. Génération échouée (remboursement)
- **Étant donné** une génération déclenchée,  
- **Quand** le job passe `failed`,  
- **Alors** le solde redevient `balance + 10`, message d’erreur affiché.

### D. Double‑clic / refresh
- **Étant donné** un clic sur **Générer**,  
- **Quand** je double‑clique ou je rafraîchis,  
- **Alors** la même `Idempotency‑Key` évite **toute double charge** et retourne le même `jobId`.

### E. Revente
- **Étant donné** un Pokémon en collection,  
- **Quand** je clique **Revendre**,  
- **Alors** l’item est supprimé et le solde devient `balance + 5` (opération atomique).

### F. Solde insuffisant
- **Étant donné** `balance < 10`,  
- **Quand** je clique **Générer**,  
- **Alors** l’action est bloquée et je vois un message “Solde insuffisant”.

---

## 🧰 Pseudocode (front) — hooks principaux

```js
// useTokens.js
export function useTokens() {
  const [balance, setBalance] = useState(null);

  const refresh = async () => {
    // mode serveur
    // const { data } = await client.get("/tokens/balance");
    // setBalance(data.balance);

    // mode offline-first
    const db = await initDB();
    await ensureInitialTokens(db);
    setBalance(await getBalance(db));
  };

  useEffect(() => { refresh(); }, []);
  return { balance, refresh };
}
```

```js
// useGeneratePokemon.js
export function useGeneratePokemon() {
  const [status, setStatus] = useState("idle");

  const generate = async (prompt) => {
    setStatus("queued");
    const key = crypto.randomUUID(); // Idempotency-Key

    try {
      // Serveur (recommandé)
      const { data } = await client.post("/generate", { prompt }, {
        headers: { "Idempotency-Key": key }
      });
      if (data.chargeApplied) {
        // Option: mettre à jour le solde localement en attendant le poll
      }
      setStatus("running");
      // poll jusqu'à succeeded/failed...
    } catch (e) {
      setStatus("failed");
      // afficher message
    }
  };

  return { status, generate };
}
```

```js
// useSellPokemon.js
export function useSellPokemon() {
  return async (pokemonId) => {
    // Serveur
    const { data } = await client.post("/sell", { pokemonId });
    return data.balance;

    // Offline-first (exemple)
    // const db = await initDB();
    // const { newBalance } = await txSellPokemon(db, pokemonId);
    // return newBalance;
  };
}
```

---

## 🧩 Messages & erreurs normalisés (UI)

- **Solde insuffisant** : “Solde insuffisant (10 jetons requis).”  
- **Échec génération** : “La génération a échoué. Aucun jeton perdu.” *(si refund)*  
- **Idempotence** : “Une génération est déjà en cours pour cette action.”  
- **Revente déjà effectuée** : “Ce Pokémon a déjà été revendu.”  
- **Quota/Rate limit** : “Trop de requêtes, réessayez plus tard.”

Associer ces messages aux **codes/erreurs** du contrat API (`04_api_endpoints.md`).

---

## 🔍 Télémétrie minimale

- `generation_started`, `generation_completed`, `generation_failed` (latences, modèle, taille).  
- `sell_confirmed` (latence, succès/erreur).  
- `token_balance_changed` (ancien → nouveau).

Respecter la confidentialité (pas de prompts sensibles en clair si analytics externes).

---

## ✅ Checklist logique

- [ ] Débit `−10` **idempotent** au démarrage du job (remboursement si échec).  
- [ ] Revente `+5` **atomique** avec suppression inventaire.  
- [ ] Bouton Générer **bloqué** si `< 10` jetons.  
- [ ] Double‑clic/refresh **sans double débit** (clé idempotente persistée).  
- [ ] Offline‑first : transactions locales cohérentes + réconciliation serveur.  
- [ ] Messages d’erreurs et télémétrie normalisés.

---

## 🔗 Références internes

- `03_indexeddb_schema.md` — transactions & helpers.  
- `04_api_endpoints.md` — contrats serveur exacts.  
- `06_integration_frontend.md` — câblage des hooks et composants UI.
