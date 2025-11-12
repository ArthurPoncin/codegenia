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
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold text-brand-black">Préférences</h1>
        <p className="text-sm text-brand-gray">
          Gère les données locales de PokéForge et exporte ta collection si besoin.
        </p>
      </header>
      <div className="flex flex-wrap gap-3">
        <Button onClick={resetDB} className="bg-brand-red text-white">
          Réinitialiser IndexedDB
        </Button>
        <Button variant="secondary" onClick={exportDB}>
          Exporter les données
        </Button>
      </div>
    </section>
  );
}

export default Settings;
