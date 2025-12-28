import { useState } from "react";
import PokemonCard from "@/components/domain/PokemonCard.jsx";
import { useInventory } from "@/features/pokemons/useInventory.js";
import { useSellPokemon } from "@/features/pokemons/useSellPokemon.js";

function PokemonGrid({ mode = "offline" }) {
  const { items, loading, error } = useInventory({ mode });
  const { sell, loading: selling, error: sellError } = useSellPokemon({ mode });
  const [currentId, setCurrentId] = useState(null);

  async function handleSell(id) {
    setCurrentId(id);
    try {
      await sell(id);
    } catch (err) {
      console.error("[PokemonGrid] Sell failed", err);
    } finally {
      setCurrentId(null);
    }
  }

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-live="polite">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-64 animate-pulse rounded-2xl bg-surface-100" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-brand-gray" role="status">
        Ta collection est vide pour l’instant. Génère un Pokémon pour commencer !
      </p>
    );
  }

  return (
    <div className="space-y-4" aria-live="polite">
      {(error || sellError) && (
        <div role="alert" className="rounded-xl border border-brand-red/30 bg-brand-red/5 px-4 py-3 text-sm text-brand-red">
          {error?.message || sellError?.message || "Une erreur est survenue."}
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((pokemon) => {
          const sellingCurrent = selling && currentId === pokemon.id;
          return (
            <PokemonCard
              key={pokemon.id}
              name={pokemon.name}
              imageUrl={pokemon.image?.url || pokemon.imageUrl}
              createdAt={pokemon.createdAt}
              rarity={pokemon.rarity}
              onSell={() => handleSell(pokemon.id)}
              isSelling={sellingCurrent}
            />
          );
        })}
      </div>
    </div>
  );
}

export default PokemonGrid;
