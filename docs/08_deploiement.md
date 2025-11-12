# 08 — Déploiement (Build, Hébergement, CI/CD)

Ce document définit comment **builder**, **déployer** et **opérer** PokéForge en production : Vite, variables d’environnement, Vercel/Netlify, optimisation d’assets, sécurité, monitoring, et pipelines CI/CD.

---

## 🏗️ Build (Vite)

### Scripts NPM
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview -p 4173"
  }
}
```

### Build local
```bash
npm run build
npm run preview
```
Le dossier **`dist/`** est prêt pour un hébergement **statique** (CDN/edge).

---

## 🔐 Variables d’environnement

Créer un `.env.example` :
```bash
VITE_API_BASE_URL=https://api.pokeforge.example.com/v1
VITE_API_KEY=demo-key
```
- Ne **jamais commiter** les vraies clés.  
- En prod, injecter via le provider (Vercel/Netlify) ou secrets CI.

---

## ☁️ Vercel (recommandé pour statique + edge)

### Déploiement rapide
1. **Importer** le repo Git dans Vercel.  
2. Framework : **Vite** (auto‑détecté).  
3. Ajouter les **Environment Variables** (`VITE_*`).  
4. Build command : `npm run build` — Output dir : `dist`.

### Headers/Cache (vercel.json)
```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

### Prévisualisations
- Toute **PR** crée un **Preview Deployment**.  
- Valider Design, A11y, et flows “générer/revendre” sur l’URL preview.

---

## 🌐 Netlify (alternative)

### netlify.toml
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### Redirects (SPA)
Créer `public/_redirects` :
```
/*  /index.html  200
```

---

## 🐳 Option Docker (serveur statique)

`Dockerfile` :
```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Cache agressif pour /assets/
RUN printf "location /assets/ { add_header Cache-Control 'public, max-age=31536000, immutable'; }\n" > /etc/nginx/conf.d/cache.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build & run :
```bash
docker build -t pokeforge:latest .
docker run -p 8080:80 pokeforge:latest
```

---

## 📦 CDN & assets

- Activer **compression** (Brotli/Gzip) et **cache immuable** pour `assets/`.  
- **Images générées** : servir via un **CDN** (signed URLs si nécessaire).  
- Taille recommandée : **≤ 1 Mo** par image, max **512×512** pour la grille.

---

## 🛡️ Sécurité front

- Charger uniquement via **HTTPS**.  
- **CSP** (Content Security Policy) stricte — autoriser `img-src` vers le CDN d’images IA.  
- **No secrets** dans le code client (les variables `VITE_*` sont visibles côté client).  
- Valider les **URLs d’images** et `alt` text pour contrer des injections DOM.

Exemple d’en‑tête CSP (à adapter) :
```
Content-Security-Policy:
default-src 'self';
img-src 'self' https://cdn.pokeforge.example.com data: blob:;
script-src 'self';
style-src 'self' 'unsafe-inline';
connect-src 'self' https://api.pokeforge.example.com;
```

---

## 📊 Observabilité & monitoring

- **Web Vitals** (CLS/LCP/INP) → envoyés à un endpoint analytiques si besoin.  
- **Logs d’erreurs** front (Sentry ou équivalent).  
- **Uptime** API : ping `/health`.  
- **Quota/rate limit** : dashboards côté backend (si serveur‑autoritaire).

Snippet Web Vitals (optionnel) :
```js
import { onCLS, onINP, onLCP } from "web-vitals";
onCLS(console.log);
onINP(console.log);
onLCP(console.log);
```

---

## 🤖 CI/CD — GitHub Actions

### Build & tests
`.github/workflows/ci.yml` :
```yaml
name: CI
on: [push, pull_request]

jobs:
  build-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: "npm" }
      - run: npm ci
      - run: npm run lint
      - run: npm test -- --ci --runInBand
      - run: npm run build
```

### Deploy (Vercel)
`.github/workflows/deploy-vercel.yml` (exemple simplifié) :
```yaml
name: Deploy Vercel
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: "npm" }
      - run: npm ci && npm run build
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: .
          vercel-args: '--prod'
```

### Deploy (Netlify)
`.github/workflows/deploy-netlify.yml` :
```yaml
name: Deploy Netlify
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: "npm" }
      - run: npm ci && npm run build
      - uses: nwtgck/actions-netlify@v3.0
        with:
          publish-dir: './dist'
          production-deploy: true
          github-token: ${{ secrets.GITHUB_TOKEN }}
          netlify-auth-token: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          netlify-site-id: ${{ secrets.NETLIFY_SITE_ID }}
```

---

## 🧪 Post‑déploiement

- Vérifier routes SPA (fallback sur `index.html`).  
- Tester flux complets en **Preview** (génération → revente).  
- Scanner A11y/Perf (Lighthouse) sur l’URL déployée.  
- Surveiller erreurs console et 4xx/5xx réseau.

---

## ✅ Checklist déploiement

- [ ] `npm run build` génère `dist/` sans erreur.  
- [ ] Variables `VITE_*` configurées sur l’hébergeur.  
- [ ] Cache assets immuable + compression activée.  
- [ ] SPA redirects en place (Netlify).  
- [ ] CSP et HTTPS actifs.  
- [ ] CI : builds + tests passent, déploiement auto sur `main`.  
- [ ] Monitoring de base (Web Vitals + erreurs).

---

## 🔗 Références internes

- `01_structure_projet.md` — scripts et arborescence.  
- `04_api_endpoints.md` — URLs, rate limits, `/health`.  
- `07_tests_qualite.md` — validations avant déploiement.
