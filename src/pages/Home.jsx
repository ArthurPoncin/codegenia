// src/pages/Home.jsx
import { Link } from "react-router-dom";
import Button from "@/components/ui/Button.jsx";
import PokemonCard from "@/components/domain/PokemonCard.jsx";
import { generatePokemonFromApi } from "@/services/pokemonApiService.js";

const heroStats = [
  { value: "100", label: "Jetons offerts pour démarrer" },
  { value: "-10", label: "Coût d’une génération" },
  { value: "+5", label: "Revente de carte réussie" },
];

const featureCards = [
  {
    title: "Imagine ton Pokémon",
    description: "Décris ton idée, choisis une ambiance et laisse PokéForge interpréter ton imagination.",
    accent: "Concept",
  },
  {
    title: "Forge instantanément",
    description: "Notre IA façonne une illustration haute définition, prête à rejoindre ton inventaire.",
    accent: "Génération",
  },
  {
    title: "Collectionne & partage",
    description: "Classe tes cartes, revends celles que tu n’utilises pas et partage tes perles rares.",
    accent: "Collection",
  },
];

const placeholderCards = Array.from({ length: 4 });

function Home() {
  return (
    <div className="space-y-16">
      <section className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/70 p-8 shadow-card backdrop-blur md:p-12">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,204,0,0.35),transparent_60%)]"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-brand-blue/20 blur-3xl"
        />
        <div className="relative flex flex-col gap-10 lg:flex-row lg:items-center">
          <div className="space-y-6 lg:w-1/2">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-yellow/50 bg-brand-yellow/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-brand-gray">
              Studio Pokémon
            </span>
            <h1 className="text-4xl font-bold tracking-tight text-brand-black sm:text-5xl">
              Forge tes Pokémon uniques
            </h1>
            <p className="max-w-xl text-base text-brand-gray">
              Lance une génération, observe la carte prendre forme et enrichis ta collection. Les meilleurs forgerons savent quand
              conserver une carte ou la revendre pour recharger leurs jetons.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Button className="px-6 py-3 text-base">Générer un Pokémon</Button>
              <Link
                to="/collection"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/70 bg-white/60 px-5 py-2.5 text-sm font-semibold text-brand-black shadow-card backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:border-brand-yellow/60"
              >
                Explorer la collection
              </Link>
            </div>
            <dl className="grid gap-4 sm:grid-cols-3">
              {heroStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/60 bg-white/70 p-4 shadow-card backdrop-blur"
                >
                  <dt className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-gray">{stat.label}</dt>
                  <dd className="mt-2 text-2xl font-bold text-brand-black">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="relative flex-1">
            <div className="grid gap-4 sm:grid-cols-2">
              {placeholderCards.map((_, index) => (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-3xl border border-white/60 bg-gradient-to-br from-white/70 via-white/50 to-white/20 p-4 shadow-card backdrop-blur"
                >
                  <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.45),transparent_60%)]">
                    <div className="h-full w-full rounded-[1.2rem] bg-gradient-to-br from-brand-blue/25 via-surface-100 to-brand-yellow/30" />
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 bg-card-shine opacity-0 transition duration-300 group-hover:opacity-80"
                    />
                  </div>
                  <div className="mt-3 space-y-2">
                    <div className="h-3.5 w-3/4 rounded-full bg-surface-200" />
                    <div className="h-3 w-1/2 rounded-full bg-surface-200" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-8">
        <header className="space-y-3">
          <h2 className="text-2xl font-semibold text-brand-black sm:text-3xl">Un atelier complet pour dompter la forge</h2>
          <p className="max-w-2xl text-brand-gray">
            Chaque étape de PokéForge est pensée pour rester fluide et élégante. Les micro-interactions et la hiérarchie visuelle
            t’accompagnent dans tes choix.
          </p>
        </header>
        <div className="grid gap-5 md:grid-cols-3">
          {featureCards.map((feature) => (
            <article
              key={feature.title}
              className="group relative overflow-hidden rounded-2xl border border-white/60 bg-white/70 p-6 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-lift backdrop-blur"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-card-shine opacity-0 transition duration-300 group-hover:opacity-80"
              />
              <span className="inline-flex items-center rounded-full border border-brand-yellow/50 bg-brand-yellow/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-brand-gray">
                {feature.accent}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-brand-black">{feature.title}</h3>
              <p className="mt-2 text-sm text-brand-gray">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden rounded-3xl border border-brand-blue/30 bg-brand-blue/10 p-10 text-center shadow-card backdrop-blur">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.45),transparent_60%)]"
        />
        <div className="relative mx-auto max-w-2xl space-y-4">
          <h2 className="text-3xl font-semibold text-brand-black">Prêt à forger ta prochaine carte légendaire ?</h2>
          <p className="text-base text-brand-gray">
            Aligne ton idée, ajuste tes paramètres et lance la génération. Chaque création renforce ta maîtrise de la forge.
          </p>
          <Button className="px-6 py-3 text-base">Lancer une génération</Button>
        </div>
      </section>
    </div>
  );
}

export default Home;
