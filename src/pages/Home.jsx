import { useState } from "react";
import Button from "@/components/ui/Button.jsx";
import PokemonCard from "@/components/domain/PokemonCard.jsx";
import { generatePokemonFromApi } from "@/services/pokemonApiService.js";

function Home() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPokemon, setGeneratedPokemon] = useState(null);
  const [error, setError] = useState(null);

  const handleGenerateClick = async () => {
    if (isGenerating) {
      return;
    }

    setError(null);
    setIsGenerating(true);

    try {
      const pokemon = await generatePokemonFromApi();
      setGeneratedPokemon(pokemon);
    } catch (err) {
      console.error("[Generation]", err);
      setError(err.message || "Une erreur est survenue lors de la génération.");
    } finally {
      setIsGenerating(false);
    }
  };

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

      <div className="space-y-4">
        <Button
          className="px-6 py-3 text-base"
          onClick={handleGenerateClick}
          disabled={isGenerating}
        >
          {isGenerating ? "Génération en cours..." : "Générer un Pokémon"}
        </Button>

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}
      </div>

      {generatedPokemon && (
        <div>
          <h2 className="text-2xl font-semibold text-brand-black">Dernière création</h2>
          <div className="mt-4 max-w-sm">
            <PokemonCard
              name={generatedPokemon.name}
              imageUrl={generatedPokemon.imageBase64}
              createdAt={generatedPokemon.generatedAt}
              rarity={generatedPokemon.rarity}
            />
          </div>
        </div>
      )}
    </section>
  );
}

export default Home;
