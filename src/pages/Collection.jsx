import PokemonGrid from "@/components/domain/PokemonGrid.jsx";

function Collection() {
  return (
    <section className="space-y-4">
      <header>
        <h1 className="text-3xl font-semibold text-brand-black">Ta collection</h1>
        <p className="text-sm text-brand-gray">
          Retrouve ici toutes tes créations et revend celles que tu n’utilises plus.
        </p>
      </header>
      <PokemonGrid />
    </section>
  );
}

export default Collection;
