import { useCallback, useState } from "react";
import sellPokemon from "@/api/sales.js";
import { useTokens } from "@/features/tokens/useTokens.js";
import { useInventory } from "@/features/pokemons/useInventory.js";

export function useSellPokemon({ mode = "offline" } = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { applyResaleReward, syncBalance } = useTokens();
  const { removeLocal } = useInventory({ mode, autoLoad: false });

  const sell = useCallback(
    async (pokemonId, config) => {
      setLoading(true);
      setError(null);
      try {
        const data = mode === "offline" ? null : await sellPokemon(pokemonId, config);

        await removeLocal(pokemonId);
        await applyResaleReward(pokemonId);

        if (typeof data?.balance === "number") {
          await syncBalance(data.balance);
        }

        return data;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [applyResaleReward, removeLocal, syncBalance]
  );

  const reset = useCallback(() => setError(null), []);

  return {
    sell,
    loading,
    error,
    reset,
  };
}

export default useSellPokemon;
