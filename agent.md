# Agent Onboarding — PokéForge

Bienvenue, Agent.  
Ce guide t’explique comment naviguer, comprendre et étendre la base de code **PokéForge**, une application React utilisant IndexedDB et une API text‑to‑image pour générer des Pokémon uniques.

---

## 🧭 Orientation générale

L’application repose sur 8 documents principaux dans `docs/`, chacun couvrant un aspect critique du projet. Lis‑les **dans cet ordre** :

1. **`01_structure_projet.md`** — architecture du projet React, dépendances, conventions et structure.  
2. **`02_design_application.md`** — système visuel Tailwind, identité Pokémon, UX/UI.  
3. **`03_indexeddb_schema.md`** — stockage local, transactions et migrations IndexedDB.  
4. **`04_api_endpoints.md`** — contrats API, payloads, erreurs, idempotence et webhooks.  
5. **`05_logic_metier.md`** — économie des jetons, états, garde‑fous et cohérence.  
6. **`06_integration_frontend.md`** — intégration complète des hooks React, pages et composants.  
7. **`07_tests_qualite.md`** — stratégie de tests, accessibilité et couverture qualité.  
8. **`08_deploiement.md`** — build, hébergement (Vercel/Netlify/Docker) et CI/CD.

---

## 🧩 Mission de l’agent

Avant toute modification du code :

- **Assimiler le contexte complet** des documents. Chaque fichier forme un module de connaissance cohérent (structure → design → API → logique → intégration → tests → déploiement).  
- **Utiliser la documentation comme source de vérité** : ne pas improviser un comportement non documenté.  
- **Comparer le code** à la documentation ; si tu trouves des divergences, note‑les dans un changelog.  
- **Synchroniser les mises à jour** : quand tu modifies la logique ou les endpoints, ajuste immédiatement le `.md` correspondant.  
- **Conserver les invariants** :  
  - Jetons : 100 init, −10 génération, +5 revente.  
  - Idempotence : une génération = un seul débit.  
  - Offline‑first : toujours transactionnel, jamais d’état incohérent.

---

## ⚙️ Méthodologie de travail

1. **Lire avant d’agir** : commence par `docs/01_structure_projet.md` puis parcours les autres fichiers dans l’ordre logique.  
2. **Annoter** les sections du code avec la référence de documentation correspondante (`// voir docs/04_api_endpoints.md § /generate`).  
3. **Tester localement** (voir `07_tests_qualite.md`) avant tout commit sur `main`.  
4. **Mettre à jour la doc** si tu modifies :  
   - un endpoint API,  
   - une règle de jetons,  
   - un flux métier (génération, revente, solde),  
   - un comportement IndexedDB,  
   - un process CI/CD.

---

## 🧠 Mentalité d’agent

- **Exactitude > rapidité.**  
- **Documentation = vérité.** Si un comportement diverge, c’est le code qui est suspect.  
- **Pas de magie.** Toute logique doit être explicable et testée.  
- **Clarté avant complexité.** Code lisible, UI cohérente, transitions fluides.  
- **Cohérence terminologique.** Utilise les mêmes mots que la doc : “génération”, “revente”, “jetons”, “inventaire”.

---

## 🧪 Validation avant merge

Avant de fusionner ton travail :

- [ ] Tous les tests passent (unitaires + e2e).  
- [ ] Aucun avertissement ESLint.  
- [ ] Documentation mise à jour.  
- [ ] Déploiement preview validé (Design + UX + flux métier).  
- [ ] Comportement API cohérent avec `04_api_endpoints.md`.  
- [ ] Solde de jetons cohérent après une génération et une revente.

---

## 🔗 Navigation rapide des documents

| Fichier | Sujet principal |
|:--|:--|
| `01_structure_projet.md` | Arborescence, Vite, Tailwind |
| `02_design_application.md` | Identité visuelle, composants, UX |
| `03_indexeddb_schema.md` | Stockage local, transactions, migrations |
| `04_api_endpoints.md` | Endpoints, payloads, erreurs, idempotence |
| `05_logic_metier.md` | Jetons, cohérence, machine à états |
| `06_integration_frontend.md` | Hooks React, pages, intégration complète |
| `07_tests_qualite.md` | Tests unitaires, intégration, a11y, perf |
| `08_deploiement.md` | Build, hébergement, CI/CD |

---

## 🧾 Résumé opérationnel

| Domaine | Objectif | Vérification |
|----------|-----------|--------------|
| Jetons | Cohérence des transactions | Solde stable après cycles complets |
| Génération | IA + text‑to‑image fiable | Idempotence & refund en cas d’échec |
| IndexedDB | Stockage persistant local | Transactions atomiques testées |
| API | Endpoints documentés & cohérents | Codes & schémas conformes |
| UI/UX | Design Pokémon clair & cohérent | Respect du thème Tailwind & A11y |
| Qualité | Tests et lint | CI verte |
| Déploiement | Builds reproductibles | Préviews & CDN fonctionnels |

---

## 🧩 Objectif final

L’agent doit être capable de **comprendre, maintenir et étendre** PokéForge **sans supervision**, en se basant uniquement sur les fichiers de documentation.  
Chaque `.md` est un **module de vérité** — ensemble, ils forment la carte complète du projet.

**Bienvenue dans PokéForge.** Garde ton IDE ouvert, ton terminal prêt et ton sens critique affûté.
