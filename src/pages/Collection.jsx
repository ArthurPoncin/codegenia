import Button from "@/components/ui/Button.jsx";

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

      <div className="rounded-3xl border border-dashed border-brand-blue/40 bg-white/70 p-10 text-center shadow-card backdrop-blur">
        <div className="mx-auto max-w-xl space-y-4">
          <h2 className="text-xl font-semibold text-brand-black">Ton inventaire est encore vide</h2>
          <p className="text-sm text-brand-gray">
            Lance une génération pour créer ta première carte. Tu pourras ensuite revendre les doublons et suivre l’évolution de
            ton solde de jetons.
          </p>
          <Button className="px-6 py-3 text-base">Générer un Pokémon</Button>
        </div>
      </div>
    </section>
  );
}

export default Collection;
