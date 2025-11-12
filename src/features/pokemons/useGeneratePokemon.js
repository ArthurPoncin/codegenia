import { useCallback, useState } from "react";
import {
  startGenerationJob,
  pollGenerationJob,
} from "@/api/generation.js";
import { useTokens } from "@/features/tokens/useTokens.js";

function createIdempotencyKey(provided) {
  if (provided) return provided;
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `job_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

// Voir docs/05_logic_metier.md — génération avec idempotence & refund
export function useGeneratePokemon({ pollIntervalMs = 1500, maxAttempts = 30 } = {}) {
  const [status, setStatus] = useState("idle");
  const [job, setJob] = useState(null);
  const [error, setError] = useState(null);
  const { applyGenerationCharge, refundGenerationCharge, syncBalance } = useTokens();

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

      const idempotencyKey = createIdempotencyKey(providedKey);
      let chargeApplied = false;
      let jobData;

      try {
        jobData = await startGenerationJob(payload, {
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
