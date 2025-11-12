import Button from "@/components/ui/Button.jsx";

function Home() {
  return (
    <section className="space-y-8">
      <header className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight text-brand-black">
          Forge tes Pokémon uniques
        </h1>
        <p className="max-w-2xl text-base text-brand-gray">
          Lance une génération pour créer un nouveau compagnon et enrichir ton inventaire. Chaque création coûte 10 jetons,
          mais tu peux revendre pour en récupérer 5.
        </p>
      </header>
      <Button className="px-6 py-3 text-base">Générer un Pokémon</Button>
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
