import Button from "@/components/ui/Button.jsx";

function Home() {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Forge tes Pokémon uniques</h1>
        <p className="text-slate-600">
          Lance une génération pour créer un nouveau compagnon et enrichir ton inventaire.
        </p>
      </header>
      <Button type="button">Générer un Pokémon</Button>
    </section>
  );
}

export default Home;
