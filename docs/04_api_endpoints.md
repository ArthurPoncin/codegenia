# 04 — API Endpoints (PokéAPI)

Ce document décrit l’API **réellement utilisée** par PokéForge : **PokéAPI**.  
L’application ne consomme plus l’ancien backend de génération (désormais indisponible).  
Les jetons et l’inventaire restent **offline‑first** via IndexedDB (voir `03_indexeddb_schema.md`).

---

## ✅ Base URL

```
https://pokeapi.co/api/v2
```

> **Aucune authentification** requise. Les endpoints sont publics et limités en débit.

---

## 🧩 Endpoints utilisés

### 1) Détails d’un Pokémon
`GET /pokemon/{id | name}`

**Exemple**
```
GET https://pokeapi.co/api/v2/pokemon/pikachu
```

**Champs exploités dans l’UI**
```json
{
  "id": 25,
  "name": "pikachu",
  "base_experience": 112,
  "sprites": {
    "other": {
      "official-artwork": {
        "front_default": "https://..."
      }
    }
  },
  "species": { "url": "https://pokeapi.co/api/v2/pokemon-species/25" }
}
```

**Mapping UI**
- `imageUrl` → `sprites.other.official-artwork.front_default`
- Fallback → `sprites.other.dream_world.front_default` puis `sprites.front_default`
- `name` → affiché après **capitalisation** (ex. `pikachu` → `Pikachu`)

---

### 2) Espèce d’un Pokémon (rarity)
`GET /pokemon-species/{id | name}`

**Exemple**
```
GET https://pokeapi.co/api/v2/pokemon-species/25
```

**Champs exploités**
```json
{
  "is_legendary": false,
  "is_mythical": false,
  "capture_rate": 190
}
```

**Règles de rareté (frontend)**
1. `is_legendary === true` → `legendary`
2. `is_mythical === true` → `epic`
3. Sinon, utiliser `base_experience` :
   - `>= 240` → `legendary`
   - `>= 200` → `epic`
   - `>= 120` → `rare`
   - `< 120` → `common`

---

## 🔁 Génération (nouveau comportement)

La “génération” consiste à **sélectionner** un Pokémon via PokéAPI :

- Si l’utilisateur fournit un **nom** (ex. `pikachu`), on requête ce Pokémon.
- Sinon, l’app choisit un **ID aléatoire** (1 → 1025).
- En cas d’échec (404 sur un nom), un **fallback aléatoire** est utilisé.

Cette génération n’est **pas asynchrone** : un seul appel HTTP par endpoint.

---

## ⚠️ Erreurs & limitations

- `404 NOT FOUND` → nom ou ID introuvable.
- `429 TOO MANY REQUESTS` → rate limit (backoff recommandé).
- `5xx` → indisponibilité temporaire de PokéAPI.

Messages d’erreur standard côté UI :
- “Impossible de contacter PokéAPI. Vérifie ta connexion réseau.”
- “Pokémon introuvable. Essaie un autre nom.”

---

## ✅ Checklist d’intégration

- [ ] Utiliser `GET /pokemon/{id|name}` pour récupérer l’image et le nom.
- [ ] Utiliser `GET /pokemon-species/{id|name}` pour la rareté.
- [ ] Mapper les images selon l’ordre (official‑artwork → dream_world → front_default).
- [ ] Génération aléatoire si aucun nom valide.
- [ ] Tokens & inventaire gérés en **offline‑first** (IndexedDB).

---

## 🔗 Références internes

- `03_indexeddb_schema.md` — tokens & inventaire offline‑first  
- `05_logic_metier.md` — règles jetons (−10/+5)  
- `06_integration_frontend.md` — intégration React & hooks
