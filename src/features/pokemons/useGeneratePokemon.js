import { useCallback, useState } from "react";
import { generatePokemonFromApi } from "@/services/pokemonApiService.js";
import { useTokens } from "@/features/tokens/useTokens.js";
import { useInventory } from "@/features/pokemons/useInventory.js";
import { MAX_POKEMON_NAME_LENGTH } from "@/lib/constants.js";

function createIdempotencyKey(provided) {
  if (provided) return provided;
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `job_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function resolvePromptPayload(payload) {
  if (typeof payload === "string") {
    return { prompt: payload };
  }
  return payload ?? {};
}

function buildPokemonDocument({ generated, payload }) {
  if (!generated?.imageUrl) {
    return null;
  }

  const prompt = payload?.prompt ?? generated?.prompt;
  const baseName = payload?.name ?? generated?.name ?? prompt ?? "Pokémon";
  const name = baseName.slice(0, MAX_POKEMON_NAME_LENGTH).trim() || "Pokémon";
  const idSuffix = generated?.id ?? generated?.name ?? Date.now();

  return {
    id: `pkmn_${idSuffix}`,
    name,
    imageUrl: generated.imageUrl,
    rarity: generated.rarity ?? payload?.rarity,
    prompt,
    createdAt: Date.now(),
    source: "remote",
  };
}

export function useGeneratePokemon({ mode = "offline" } = {}) {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const { applyGenerationCharge, refundGenerationCharge } = useTokens();
  const { addLocal } = useInventory({ mode, autoLoad: false });

  const generate = useCallback(
    async (payload, { idempotencyKey: providedKey, signal } = {}) => {
      setError(null);
      setStatus("queued");

      const normalizedPayload = resolvePromptPayload(payload);
      const idempotencyKey = createIdempotencyKey(providedKey);
      let chargeApplied = false;
      let generationResult;

      try {
        const result = await applyGenerationCharge({ idempotencyKey });
        chargeApplied = result.applied;

        setStatus("running");
        generationResult = await generatePokemonFromApi({
          prompt: normalizedPayload.prompt,
          pokemonId: normalizedPayload.pokemonId,
          pokemonName: normalizedPayload.pokemonName,
          signal,
        });

        setStatus("succeeded");
        const document = buildPokemonDocument({ generated: generationResult, payload: normalizedPayload });
        if (document) {
          await addLocal(document);
        }

        return generationResult;
      } catch (err) {
        setStatus("failed");
        setError(err);

        if (chargeApplied) {
          try {
            await refundGenerationCharge({ idempotencyKey, jobId: generationResult?.id });
          } catch (refundError) {
            console.error("[Tokens] refund après échec", refundError);
          }
        }

        throw err;
      }
    },
    [addLocal, applyGenerationCharge, refundGenerationCharge]
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
  }, []);

  return {
    status,
    error,
    generate,
    reset,
  };
}

export default useGeneratePokemon;
