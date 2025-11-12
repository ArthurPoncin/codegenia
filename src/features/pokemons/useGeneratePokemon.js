import { useCallback, useState } from "react";
import { startGenerationJob, pollGenerationJob } from "@/api/generation.js";
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

function buildPokemonDocument({ job, final, payload }) {
  if (!final?.image?.url) {
    return null;
  }

  const prompt = payload?.prompt ?? payload?.metadata?.prompt;
  const baseName = payload?.name ?? prompt ?? "Pokémon";
  const name = baseName.slice(0, MAX_POKEMON_NAME_LENGTH).trim() || "Pokémon";

  const fallbackId =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `pkmn_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  return {
    id: final.image.id ?? job?.jobId ?? fallbackId,
    name,
    imageUrl: final.image.url,
    rarity: final.metadata?.rarity ?? payload?.rarity,
    prompt,
    createdAt: Date.now(),
  };
}

export function useGeneratePokemon({ pollIntervalMs = 1000, maxAttempts = 30, mode = "server" } = {}) {
  const [status, setStatus] = useState("idle");
  const [job, setJob] = useState(null);
  const [error, setError] = useState(null);
  const { applyGenerationCharge, refundGenerationCharge, syncBalance } = useTokens();
  const { addLocal } = useInventory({ mode, autoLoad: false });

  const generate = useCallback(
    async (
      payload,
      {
        idempotencyKey: providedKey,
        poll = true,
        signal,
        onUpdate,
        pollingOptions = {},
      } = {}
    ) => {
      setError(null);
      setStatus("queued");

      const normalizedPayload = resolvePromptPayload(payload);
      const idempotencyKey = createIdempotencyKey(providedKey);
      let chargeApplied = false;
      let jobData;

      try {
        jobData = await startGenerationJob(normalizedPayload, {
          idempotencyKey,
          signal,
        });

        setJob(jobData);
        setStatus(jobData.status ?? "queued");

        if (jobData.chargeApplied) {
          const result = await applyGenerationCharge({
            idempotencyKey,
            jobId: jobData.jobId,
          });
          chargeApplied = result.applied;
        }

        if (typeof jobData.balance === "number") {
          await syncBalance(jobData.balance);
        }

        if (!poll) {
          return jobData;
        }

        setStatus("running");

        const final = await pollGenerationJob(jobData.jobId, {
          intervalMs: pollIntervalMs,
          maxAttempts,
          signal,
          onUpdate,
          ...pollingOptions,
        });

        setStatus(final.status);

        if (final.status === "succeeded") {
          const document = buildPokemonDocument({ job: jobData, final, payload: normalizedPayload });
          if (document) {
            await addLocal(document);
          }
        }

        if (typeof final.balance === "number") {
          await syncBalance(final.balance);
        }

        return final;
      } catch (err) {
        setStatus("failed");
        setError(err);

        if (chargeApplied) {
          try {
            await refundGenerationCharge({ idempotencyKey, jobId: jobData?.jobId });
          } catch (refundError) {
            console.error("[Tokens] refund après échec", refundError);
          }
        }

        throw err;
      }
    },
    [
      addLocal,
      applyGenerationCharge,
      maxAttempts,
      pollIntervalMs,
      refundGenerationCharge,
      syncBalance,
    ]
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setJob(null);
    setError(null);
  }, []);

  return {
    status,
    job,
    error,
    generate,
    reset,
  };
}

export default useGeneratePokemon;
