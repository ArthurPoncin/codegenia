import GeneratorButton from "@/components/domain/GeneratorButton.jsx";
import PokemonGrid from "@/components/domain/PokemonGrid.jsx";

function Collection() {
  return (
    <section className="space-y-10">
      <header className="space-y-4">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand-blue/40 bg-brand-blue/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-brand-blue">
          Inventaire
        </span>
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold text-brand-black sm:text-4xl">Ta collection personnelle</h1>
          <p className="max-w-2xl text-brand-gray">
            Toutes tes cartes générées et les prochains ajouts s’afficheront ici. Tu pourras filtrer par rareté, date ou état de
            revente pour garder une collection harmonieuse.
          </p>
        </div>
      </header>

      <div className="rounded-3xl border border-white/60 bg-white/70 p-8 shadow-card backdrop-blur">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-brand-black">Crée de nouvelles cartes</h2>
          <p className="text-sm text-brand-gray">
            PokéAPI alimente tes créations : cherche un Pokémon précis ou laisse la forge choisir un compagnon surprise.
          </p>
          <GeneratorButton />
        </div>
      </div>

      <PokemonGrid />
    </section>
  );
}

export default Collection;
