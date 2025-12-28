# 00 — Préambule pour les tâches IA

## 🎯 Contexte général

Tu travailles sur **PokéForge**, une application React (Vite + Tailwind) avec **IndexedDB** et **PokéAPI** pour générer des Pokémon.  
Les comportements, règles métier, API et design sont **définis dans les fichiers `docs/**/*.md`** (01–08).  
Chaque tâche doit strictement respecter ces documents.

---

## ⚙️ Exigences globales

- **Technologie :** React (JSX), Tailwind CSS, Hooks React.  
- **Icônes :** utiliser exclusivement `lucide-react`.  
- **UI :** pas d’installation de librairies externes sauf mention explicite.  
- **Design :** moderne, ludique, fidèle à l’identité Pokémon. Pas de “cookie cutter”.  
- **UX :** interdit d’utiliser `alert()` → utiliser une **modale** ou **toast** Tailwind.  
- **Stockage :** utiliser **Supabase Storage** pour toutes les images/documents.  
  - Créer le bucket si nécessaire.  
  - Dossier racine = `event_id`, fichiers à l’intérieur.  
  - Ajouter le nouveau bucket au *Storage Management* (Maintenance).  
- **Invariants métier :**
  - 100 jetons initiaux  
  - −10 jetons pour une génération  
  - +5 jetons à la revente  
  - Génération idempotente : un seul débit par clé unique.  
- **IndexedDB :** toutes les opérations doivent être **atomiques et cohérentes**.

---

## 📘 Pour chaque tâche

1. **Lire les sections pertinentes** des fichiers `docs/`.  
2. **Décrire la solution** (composants, hooks, flux).  
3. **Fournir le code** complet et clair (React/Tailwind).  
4. **Inclure des tests** si la tâche implique de la logique.  
5. **Vérifier la conformité** aux règles ci‑dessus.  

---

## ✅ Checklist rapide

- [ ] Conformité avec les fichiers `docs/01–08`  
- [ ] JSX + Tailwind + lucide-react uniquement  
- [ ] Pas d’`alert()` → modale/toast  
- [ ] Supabase Storage (bucket/policies corrects)  
- [ ] Invariants tokens (100 / −10 / +5) respectés  
- [ ] Idempotence garantie  
- [ ] IndexedDB cohérente  
- [ ] A11y et états de chargement/erreur

---

## 🧩 Format attendu de réponse

- **Brève description technique** (objectifs, architecture).  
- **Code complet** (fichier unique ou extrait fonctionnel).  
- **Notes d’intégration** (fichiers impactés, import à ajouter).  
- **Validation checklist**.

---

## 🧠 Exemple de tâche

### Tâche
Implémenter le bouton “Générer (−10)” et le flux de génération asynchrone.

### Contexte
Voir `04_api_endpoints.md` (PokéAPI), `05_logic_metier.md` (idempotence, débit −10), `06_integration_frontend.md` (hook `useGeneratePokemon`).

### Objectif
Créer un bouton relié à la logique métier :  
- Débit de −10 jetons lors de la génération  
- Polling jusqu’à la réussite  
- Insertion du Pokémon dans la collection  
- Solde de jetons mis à jour  
- Affichage modale en cas d’échec (pas d’`alert()`).

### Critères d’acceptation
- Bouton désactivé pendant la génération  
- Revente crédite +5 jetons  
- Respect du design Pokémon (Tailwind + lucide-react)  
- Idempotence (une seule génération active par clé).

---

Tu appliqueras ce préambule avant **chaque tâche** donnée à l’IA pour garantir la cohérence du projet et la conformité aux règles.
