import Button from "@/components/ui/Button.jsx";
import { initDB, DB_NAME, STORE_POKEMONS, STORE_TOKENS } from "@/db/indexedDB.js";

function Settings() {
  const resetDB = async () => {
    if (typeof window === "undefined") return;
    const confirmation = window.confirm("Réinitialiser la base locale ?");
    if (!confirmation) return;
    indexedDB.deleteDatabase(DB_NAME);
    window.alert("Base locale réinitialisée. Rechargez la page pour repartir de zéro.");
  };

  const exportDB = async () => {
    const db = await initDB();
    const tokens = await db.get(STORE_TOKENS, "userTokens");
    const pokemons = await db.getAll(STORE_POKEMONS);
    const blob = new Blob([JSON.stringify({ tokens, pokemons }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = Object.assign(document.createElement("a"), {
      href: url,
      download: "pokeforge-export.json",
    });
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="space-y-10">
      <header className="space-y-4">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand-yellow/50 bg-brand-yellow/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-brand-gray">
          Préférences
        </span>
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold text-brand-black sm:text-4xl">Paramètre ton atelier</h1>
          <p className="max-w-2xl text-brand-gray">
            Ajuste l’expérience pour qu’elle corresponde à ta façon de forger. Ces options évolueront avec les prochaines
            fonctionnalités.
          </p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <article className="group relative overflow-hidden rounded-2xl border border-white/60 bg-white/70 p-6 shadow-card backdrop-blur">
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-card-shine opacity-0 transition duration-300 group-hover:opacity-80"
          />
          <h2 className="text-lg font-semibold text-brand-black">Thème & ambiance</h2>
          <p className="mt-2 text-sm text-brand-gray">
            Choisis ton style visuel : clair, sombre ou couleurs dynamiques inspirées des différentes générations Pokémon.
          </p>
          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-between rounded-2xl border border-white/60 bg-white/70 px-4 py-3">
              <span className="text-sm font-medium text-brand-black">Thème clair</span>
              <span className="rounded-full border border-brand-yellow/40 bg-brand-yellow/20 px-3 py-1 text-xs font-semibold text-brand-gray">
                Par défaut
              </span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-dashed border-white/50 px-4 py-3 text-sm text-brand-gray">
              <span>Thème sombre</span>
              <span className="text-xs uppercase tracking-[0.3em]">Bientôt</span>
            </div>
          </div>
        </article>

        <article className="group relative overflow-hidden rounded-2xl border border-white/60 bg-white/70 p-6 shadow-card backdrop-blur">
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-card-shine opacity-0 transition duration-300 group-hover:opacity-80"
          />
          <h2 className="text-lg font-semibold text-brand-black">Gestion des données</h2>
          <p className="mt-2 text-sm text-brand-gray">
            Exporte ton inventaire ou réinitialise la base locale. Nous préparons également la synchronisation multi-appareil.
          </p>
          <ul className="mt-5 space-y-3 text-sm text-brand-gray">
            <li className="rounded-2xl border border-white/60 bg-white/70 px-4 py-3">Export CSV — bientôt disponible</li>
            <li className="rounded-2xl border border-white/60 bg-white/70 px-4 py-3">Import à partir d’un code de session</li>
            <li className="rounded-2xl border border-dashed border-white/50 px-4 py-3 uppercase tracking-[0.3em]">Réinitialiser l’inventaire (à venir)</li>
          </ul>
        </article>
      </div>
    </section>
  );
}

export default Settings;
