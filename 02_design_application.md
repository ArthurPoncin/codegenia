# 02 — Design de l’application (Identité Pokémon + Tailwind)

Ce document définit l’**identité visuelle**, les **composants UI**, le **layout**, et les **règles UX** de PokéForge.  
Objectif : offrir une expérience ludique, rapide et accessible, inspirée de l’univers Pokémon tout en restant moderne.

---

## 🎨 Identité visuelle

### Palette (thème clair par défaut)
Palette inspirée des couleurs historiques (rouge, bleu, jaune) + neutres modernes.

```js
// tailwind.config.js (extrait thème)
export default {
  theme: {
    extend: {
      colors: {
        brand: {
          red:   "#E3350D",   // accent principal (boutons positifs)
          blue:  "#3568D4",   // liens, états focus
          yellow:"#FFCC00",   // accents ludiques, badges rareté
          black: "#2C2C2C",   // texte fort
          gray:  "#6B7280",   // texte secondaire
          white: "#FFFFFF",
        },
        surface: {
          50:  "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          800: "#1F2937",
        }
      },
      boxShadow: {
        card: "0 8px 24px rgba(0,0,0,0.08)",
        lift: "0 12px 28px rgba(0,0,0,0.14)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      }
    }
  }
}
```

> Option thème sombre : inverser les surfaces (fond sombre, cartes claires), conserver les accents brand.

### Typographie
- Police sans‑serif lisible (ex. système ou Inter).  
- Échelles recommandées : `text-xs/sm/base/lg/xl/2xl/3xl` avec `font-semibold` pour titres.

### Iconographie
- Style simple et lisible (traits épais).  
- Usage : tokens, génération (éclair), revente (flèches circulaires), succès/erreur.

---

## 🧱 Layout & pages

### Shell global
- **Header** : logo, compteur de jetons, CTA “Générer”.
- **Main** (container responsive) : pages et grilles.
- **Footer** : liens légaux, version.

```jsx
// components/layout/AppShell.jsx
export default function AppShell({ children }) {
  return (
    <div className="min-h-dvh bg-surface-50 text-brand-black">
      <header className="sticky top-0 z-40 backdrop-blur bg-white/80 border-b border-surface-200">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-4">
          <img src="/logo.svg" alt="PokéForge" className="h-8 w-8" />
          <h1 className="text-lg font-bold">PokéForge</h1>
          <div className="ml-auto">
            {/* TokenCounter */}
          </div>
          {/* Bouton Générer */}
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      <footer className="border-t border-surface-200 py-6 mt-10 text-sm text-brand-gray">
        <div className="mx-auto max-w-6xl px-4">© PokéForge</div>
      </footer>
    </div>
  );
}
```

### Pages
- **Home** : intro, CTA “Générer”, derniers Pokémon.
- **Collection** : grille responsive de cartes (tri/filtre).
- **Settings** : préférences (thème, réinitialisation locale).

Grilles recommandées :
```html
<!-- Grille responsive -->
<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"></div>
```

---

## 🧩 Composants UI

### Bouton (primaire, secondaire, destructif)
```jsx
// components/ui/Button.jsx
const base = "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition shadow hover:shadow-card disabled:opacity-60 disabled:cursor-not-allowed";
const variants = {
  primary: "bg-brand-red text-white hover:translate-y-[-1px]",
  secondary: "bg-white text-brand-black border border-surface-200 hover:bg-surface-100",
  ghost: "bg-transparent text-brand-black hover:bg-surface-100",
};

export default function Button({ variant="primary", className="", ...props }) {
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}
```

### Badge de rareté
```jsx
// components/ui/Badge.jsx
export default function Badge({ tone="common", children }) {
  const map = {
    common:   "bg-surface-200 text-brand-black",
    rare:     "bg-brand-blue text-white",
    epic:     "bg-brand-yellow text-brand-black",
    legendary:"bg-gradient-to-r from-brand-red to-brand-yellow text-black",
  };
  return <span className={`inline-block text-xs px-2 py-1 rounded ${map[tone]}`}>{children}</span>;
}
```

### Carte Pokémon
```jsx
// components/domain/PokemonCard.jsx
export default function PokemonCard({ name, imageUrl, createdAt, rarity, onSell }) {
  return (
    <article className="group relative rounded-2xl bg-white shadow-card hover:shadow-lift transition p-3">
      <div className="aspect-square overflow-hidden rounded-xl bg-surface-100">
        {imageUrl
          ? <img src={imageUrl} alt={name} className="h-full w-full object-cover group-hover:scale-[1.02] transition" />
          : <div className="h-full w-full animate-pulse" />}
      </div>
      <header className="flex items-center justify-between mt-3">
        <h3 className="text-base font-semibold">{name}</h3>
        {rarity && <span className="text-xs text-brand-gray">{rarity}</span>}
      </header>
      <div className="mt-2 flex items-center justify-between">
        <time className="text-xs text-brand-gray">{new Date(createdAt).toLocaleString()}</time>
        <button
          onClick={onSell}
          className="text-sm text-brand-blue hover:underline"
          aria-label={`Revendre ${name}`}
        >
          Revendre (+5)
        </button>
      </div>
    </article>
  );
}
```

### Compteur de jetons
```jsx
// components/domain/TokenCounter.jsx
export default function TokenCounter({ value=0 }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-xl border border-surface-200 bg-white px-3 py-1 shadow-card">
      <span aria-hidden className="inline-block h-2.5 w-2.5 rounded-full bg-brand-yellow"></span>
      <span className="text-sm font-semibold">{value}</span>
      <span className="text-xs text-brand-gray">jetons</span>
    </div>
  );
}
```

### Modale (confirmation)
```jsx
// components/ui/Modal.jsx
export function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div className="absolute inset-0 grid place-items-center p-4">
        <section className="w-full max-w-md rounded-2xl bg-white p-4 shadow-lift">
          <header className="mb-2">
            <h2 className="text-lg font-semibold">{title}</h2>
          </header>
          <div>{children}</div>
        </section>
      </div>
    </div>
  );
}
```

---

## ✨ États, animations & feedback

- **Hover/Active** : légère translation `hover:translate-y-[-1px]` sur les boutons principaux.
- **Loading** : spinners ou `animate-pulse` sur emplacements d’images.
- **Disabled** : opacité + curseur interdit, pas d’animation.
- **Transitions** : `transition` sur `transform`, `opacity`.  
- **Feedback** : toasts non intrusifs en bas (succès/erreur).

Exemple toast minimal :
```jsx
// lib/toast.js (mock minimal)
export const toast = (msg) => alert(msg); // Remplacer par une lib dédiée si besoin
```

---

## 🔎 UX & Accessibilité (A11y)

- **Contrastes** conformes (texte principal ≥ 4.5:1).  
- **Focus visible** : `focus:outline-none focus:ring-2 focus:ring-brand-blue` sur éléments interactifs.
- **Labels** : `aria-label`/`aria-describedby` pour boutons iconiques.
- **Taille cible** : zones cliquables ≥ 40×40 px.
- **Clavier** : modales fermables via `Esc`, navigation Tab/Shift+Tab cyclique.
- **Images** : `alt` descriptifs sur Pokémon.

Exemple focus utilitaire :
```html
<button class="focus:outline-none focus:ring-2 focus:ring-brand-blue rounded-md">OK</button>
```

---

## 🧪 Variants & thèmes

- Support futur **dark mode** via `class="dark"` sur `<html>` + `dark:` utilities.  
- Raretés en **variants** (`common`, `rare`, `epic`, `legendary`) déjà mappées dans `Badge`.
- **Design tokens** centralisés dans `tailwind.config.js` (couleurs, ombres, radius).

---

## 🔁 Modèles de pages

### Home
- Hero : titre, sous‑titre, CTA Générer.  
- Derniers Pokémon (4–8 cartes).  
- Encarts “Comment ça marche ?” en 3 étapes (100 jetons init → Générer −10 → Revendre +5).

### Collection
- Grille, tri (récents → anciens), filtre par rareté.  
- Action groupée (sélection + revente multiple optionnelle).

### Settings
- Thème clair/sombre, réinitialisation locale (IndexedDB), affichage des quotas API.

---

## 🧰 Exemples utilitaires CSS

```css
/* styles/utilities.css (optionnel) */
.card {
  @apply rounded-2xl bg-white shadow-card;
}
.card-hover {
  @apply hover:shadow-lift transition;
}
.section {
  @apply mx-auto max-w-6xl px-4;
}
```

---

## ✅ Checklist design

- [ ] Palette et tokens définis dans Tailwind.
- [ ] Composants UI (Button, Badge, Modal) en place.
- [ ] Cartes Pokémon responsives et accessibles.
- [ ] Compteur de jetons visible dans le header.
- [ ] États de chargement, disabled et erreurs gérés.
- [ ] Grille Collection avec tri/filtre.
- [ ] Focus styles cohérents, alt text descriptifs.
- [ ] Préparation dark mode (optionnel).

---

## 🔗 Références internes

- `01_structure_projet.md` — arborescence & config.
- `03_indexeddb_schema.md` — persistance locale.
- `04_api_endpoints.md` — contraintes UI liées aux endpoints.
- `05_logic_metier.md` — règles jetons/génération/revente.
