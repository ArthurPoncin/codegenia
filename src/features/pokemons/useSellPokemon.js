import { useCallback, useState } from "react";
import sellPokemon from "@/api/sales.js";
import { useTokens } from "@/features/tokens/useTokens.js";

// Voir docs/05_logic_metier.md — revente atomique (+5)
export function useSellPokemon() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { applyResaleReward, syncBalance } = useTokens();

  const sell = useCallback(
    async (pokemonId, config) => {
      setLoading(true);
      setError(null);
      try {
        const data = await sellPokemon(pokemonId, config);

        await applyResaleReward(pokemonId);

        if (typeof data.balance === "number") {
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
    [applyResaleReward, syncBalance]
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
