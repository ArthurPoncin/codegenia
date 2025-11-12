# 04 — API Endpoints (Text‑to‑Image Pokémon + Jetons)

Ce document spécifie **l’interface d’API** que l’UI PokéForge doit consommer.  
Les endpoints couvrent : **authentification**, **génération IA (text‑to‑image)**, **gestion des jetons**, **inventaire**, **revente**, **webhooks/polling**, **métadonnées d’images** et **santé**.

> Remarque : si vous utilisez un fournisseur tiers (ex. diffusion d’images), alignez le **contrat d’adaptation** (gateway) sur ces spécifications afin de garder l’UI stable.

---

## 🔐 Authentification

- **Schéma** : `Authorization: Bearer <API_KEY>`
- **Transmission** : HTTPS uniquement.
- **Scopes** (optionnels) : `generation:write`, `inventory:read`, `tokens:write`.

**Erreurs auth** :  
- `401 UNAUTHORIZED` — clé absente/incorrecte.  
- `403 FORBIDDEN` — clé valide mais scope insuffisant.

---

## 📏 Conventions générales

- **Base URL** : `https://api.pokeforge.example.com/v1`
- **Formats** : `application/json` pour requêtes/réponses. Les images sont retournées **par URL** (stockage distant) ou **base64** si activé.  
- **Horodatage** : ISO‑8601 (`2025-11-12T10:15:30.000Z`).  
- **Idempotence** : pour la génération, option `Idempotency-Key` (UUID) pour éviter les doublons.  
- **Rate limits** (exemple) : `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `Retry-After`.

---

## 🧪 Santé

### `GET /health`
Réponse 200 :
```json
{ "status": "ok", "uptime": 123456, "version": "1.0.0" }
```

---

## 💰 Jetons

L’économie est gérée côté serveur **ou** simulée localement (IndexedDB). Si serveur, les règles sont : **100 init**, **−10 génération**, **+5 revente**.

### `GET /tokens/balance`
Retourne le solde actuel.

**Response 200**
```json
{ "balance": 95, "updatedAt": "2025-11-12T10:35:00.000Z" }
```

### `POST /tokens/initialize`
Crédite 100 jetons **si aucun compte n’existe**.
**Response 201**
```json
{ "balance": 100, "created": true }
```

### `POST /tokens/adjust`
Ajuste le solde (usage interne sécurisé).
**Request**
```json
{ "delta": -10, "reason": "generation", "ref": "job_abc123" }
```
**Response 200**
```json
{ "balance": 90 }
```

**Erreurs**
- `409 CONFLICT` — tentative d’initialisation répétée.  
- `422 UNPROCESSABLE_ENTITY` — delta invalide.
- `402 PAYMENT_REQUIRED` — solde insuffisant.

---

## 🎨 Génération IA — Text‑to‑Image

La génération peut être **synchrone** (réponse directe) ou **asynchrone** (job + polling ou webhook).  
Coût : **−10 jetons** au **déclenchement** (idempotent) ou à **l’achèvement** (au choix, mais restez cohérent). Recommandé : **au déclenchement**.

### `POST /generate`
Crée une génération **asynchrone** (recommandée).

**Headers (optionnels)**
```
Idempotency-Key: 8dfb2a74-1c9a-4a8f-9d1a-5d7f9e9b1d2c
```

**Request**
```json
{
  "prompt": "A new electric fox-like Pokémon with glowing blue tails, anime style",
  "negativePrompt": "blurry, low quality, deformed",
  "seed": null,
  "size": { "width": 512, "height": 512 },
  "style": "anime",
  "webhookUrl": "https://app.example.com/api/webhooks/generation"
}
```

**Response 202**
```json
{
  "jobId": "job_abc123",
  "status": "queued",
  "estimatedSeconds": 18,
  "chargeApplied": true,            // -10 jetons
  "balance": 90
}
```

**Statuts possibles** : `queued` → `running` → `succeeded` | `failed` | `canceled`.

### `GET /generate/{jobId}`
Récupère l’état du job et, si disponible, l’URL d’image.

**Response 200 (en cours)**
```json
{ "jobId": "job_abc123", "status": "running", "progress": 0.42 }
```

**Response 200 (terminé)**
```json
{
  "jobId": "job_abc123",
  "status": "succeeded",
  "image": {
    "id": "img_9xk2",
    "url": "https://cdn.pokeforge.example.com/img_9xk2.png",
    "width": 512,
    "height": 512,
    "hash": "sha256-..."
  },
  "metadata": {
    "prompt": "A new electric fox-like Pokémon...",
    "negativePrompt": "blurry, low quality, deformed",
    "seed": 123456,
    "model": "sd-xl-1.0",
    "inferenceTimeMs": 17123
  }
}
```

**Erreurs**
- `402 PAYMENT_REQUIRED` — pas assez de jetons au déclenchement.
- `409 CONFLICT` — clé d’idempotence déjà utilisée.
- `429 TOO_MANY_REQUESTS` — limite atteinte.

### Webhook (optionnel) : `POST {webhookUrl}`
Payload envoyé par le serveur à la fin du job :
```json
{
  "type": "generation.completed",
  "jobId": "job_abc123",
  "status": "succeeded",
  "image": { "id": "img_9xk2", "url": "https://cdn.../img_9xk2.png" },
  "signature": "hmac-sha256:..."
}
```
Validez la signature côté client/serveur pour éviter les falsifications.

---

## 📦 Inventaire (Pokémon)

### `GET /inventory?limit=24&cursor=...`
Liste paginée des Pokémon de l’utilisateur.

**Response 200**
```json
{
  "items": [
    {
      "id": "pkmn_1",
      "name": "Voltifox",
      "image": { "id": "img_9xk2", "url": "https://cdn.../img_9xk2.png" },
      "rarity": "rare",
      "createdAt": "2025-11-12T10:40:00.000Z"
    }
  ],
  "nextCursor": "eyJpZCI6InBrbW5fMSJ9"
}
```

### `POST /inventory`
Ajoute un Pokémon (utilisé quand génération ≠ inventaire automatique).  
Appliquez une **politique unique** : soit auto‑insert à la fin de `/generate`, soit insertion manuelle ici — **pas les deux**.

**Request**
```json
{
  "id": "pkmn_1",
  "name": "Voltifox",
  "imageId": "img_9xk2",
  "rarity": "rare",
  "prompt": "A new electric fox-like Pokémon...",
  "hash": "sha256-..."
}
```
**Response 201**
```json
{ "id": "pkmn_1" }
```

### `DELETE /inventory/{pokemonId}`
Supprime un Pokémon de l’inventaire (utilisé par la revente).  
**Response 204**

**Erreurs**  
- `404 NOT_FOUND` — Pokémon ou image introuvable.
- `409 CONFLICT` — déjà vendu/absent.

---

## 🔁 Revente

### `POST /sell`
Supprime le Pokémon de l’inventaire et crédite **+5 jetons** (transaction atomique).

**Request**
```json
{ "pokemonId": "pkmn_1" }
```
**Response 200**
```json
{ "refunded": 5, "balance": 95, "pokemonId": "pkmn_1", "status": "sold" }
```

**Erreurs**
- `404 NOT_FOUND` — Pokémon introuvable.
- `409 CONFLICT` — Pokémon déjà revendu.
- `422 UNPROCESSABLE_ENTITY` — état invalide (ex. job non terminé).

---

## 🖼️ Images : métadonnées & sécurité

### `GET /images/{imageId}`
Retourne les métadonnées de l’image générée.
```json
{
  "id": "img_9xk2",
  "url": "https://cdn.../img_9xk2.png",
  "width": 512,
  "height": 512,
  "hash": "sha256-...",
  "contentType": "image/png",
  "createdAt": "2025-11-12T10:40:00.000Z"
}
```

- **Sécurité** : toutes les URLs images doivent pointer vers un **CDN**/bucket en lecture publique **signed URLs** si nécessaire.  
- **Taille max** : 1–2 Mo recommandé pour l’UI.  
- **Cache** : `Cache-Control: public, max-age=31536000, immutable` pour les assets immuables.

---

## 🧾 Schéma d’erreur standard

**Status codes**
- `400` input invalide
- `401` non authentifié
- `402` jetons insuffisants
- `403` droit manquant
- `404` introuvable
- `409` conflit/idempotence
- `422` état invalide
- `429` rate limit
- `5xx` erreur serveur

**Payload**
```json
{
  "error": {
    "code": "INSUFFICIENT_TOKENS",
    "message": "Not enough tokens to start a generation.",
    "details": { "required": 10, "balance": 6 },
    "traceId": "req_98as7d"
  }
}
```

---

## 🔐 Idempotence

- Passer `Idempotency-Key` pour `/generate` empêche la double facturation **et** la création de jobs dupliqués.  
- Réponse **202** répétable : la même clé doit retourner **le même `jobId`**.

---

## 🧩 Exemples d’utilisation

### cURL — génération asynchrone
```bash
curl -X POST "https://api.pokeforge.example.com/v1/generate" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: $(uuidgen)" \
  -d '{
    "prompt":"A crystal-dragon Pokémon, cinematic lighting",
    "size": {"width":512,"height":512}
  }'
```

### Axios — polling de job
```js
import client from "@/api/client";

async function pollJob(jobId, { intervalMs = 1500, max = 30 } = {}) {
  for (let i = 0; i < max; i++) {
    const { data } = await client.get(`/generate/${jobId}`);
    if (data.status === "succeeded") return data;
    if (data.status === "failed" || data.status === "canceled") throw new Error(data.status);
    await new Promise(r => setTimeout(r, intervalMs));
  }
  throw new Error("TIMEOUT");
}
```

### Axios — revente
```js
import client from "@/api/client";

async function sellPokemon(pokemonId) {
  const { data } = await client.post("/sell", { pokemonId });
  return data.balance; // nouveau solde
}
```

---

## ✅ Checklist d’intégration UI

- [ ] Auth Bearer configurée dans `client.js`.  
- [ ] Génération asynchrone via `/generate` + **idempotence** activée.  
- [ ] Polling **ou** webhook final (pas les deux).  
- [ ] Inventaire paginé (`/inventory`) avec insertion unique (auto **ou** manuelle).  
- [ ] Revente atomique `/sell` avec +5 jetons.  
- [ ] État d’erreur normalisé (codes + schéma).  
- [ ] Rate limits gérés (backoff, `Retry-After`).  
- [ ] Métadonnées image (dimensions/hash) validées en UI.  
- [ ] Tokens (option serveur) : `GET /tokens/balance` affiché dans le header.

---

## 🔗 Références internes

- `01_structure_projet.md` — config client API & env.  
- `02_design_application.md` — implications UI (loading, toasts, erreurs).  
- `03_indexeddb_schema.md` — persistance locale si mode offline‑first.  
- `05_logic_metier.md` — règles jetons & transitions d’état.  
- `06_integration_frontend.md` — hooks/flux côté React.
