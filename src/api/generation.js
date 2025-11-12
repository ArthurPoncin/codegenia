import client from "@/api/client.js";
import { ApiError, createAbortError } from "@/api/errors.js";

const TERMINAL_FAILURE_STATUSES = new Set(["failed", "canceled"]);

// Voir docs/04_api_endpoints.md — POST /generate
export async function startGenerationJob(
  payload,
  { idempotencyKey, signal, headers: extraHeaders = {} } = {}
) {
  const headers = { ...extraHeaders };
  if (idempotencyKey) {
    headers["Idempotency-Key"] = idempotencyKey;
  }

  const response = await client.post("/generate", payload, {
    headers,
    signal,
  });
  return response.data;
}

// Voir docs/04_api_endpoints.md — GET /generate/{jobId}
export async function getGenerationJob(jobId, config = {}) {
  if (!jobId) {
    throw new Error("getGenerationJob requires a jobId");
  }

  const response = await client.get(`/generate/${jobId}`, config);
  return response.data;
}

// Voir docs/04_api_endpoints.md — polling de job
export async function pollGenerationJob(jobId, options = {}) {
  const {
    intervalMs = 1500,
    maxAttempts = 30,
    signal,
    onUpdate,
    throwOnCanceled = true,
  } = options;

  if (!jobId) {
    throw new Error("pollGenerationJob requires a jobId");
  }

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    throwIfAborted(signal);

    const data = await getGenerationJob(jobId, { signal });
    onUpdate?.(data);

    if (data.status === "succeeded") {
      return data;
    }

    if (TERMINAL_FAILURE_STATUSES.has(data.status)) {
      if (data.status === "canceled" && !throwOnCanceled) {
        return data;
      }

      throw new ApiError({
        code: `GENERATION_${data.status.toUpperCase()}`,
        message: `Generation job ${jobId} ${data.status}.`,
        status: 409,
        details: data,
      });
    }

    await delay(intervalMs, signal);
  }

  throw new ApiError({
    code: "POLL_TIMEOUT",
    message: `Polling timed out for job ${jobId} after ${maxAttempts} attempts.`,
    status: 504,
    details: { jobId, maxAttempts, intervalMs },
  });
}

function throwIfAborted(signal) {
  if (signal?.aborted) {
    throw createAbortError();
  }
}

function delay(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(createAbortError());
      return;
    }

    const timeout = setTimeout(() => {
      if (signal) {
        signal.removeEventListener("abort", onAbort);
      }
      resolve();
    }, ms);

    const onAbort = () => {
      clearTimeout(timeout);
      if (signal) {
        signal.removeEventListener("abort", onAbort);
      }
      reject(createAbortError());
    };

    if (signal) {
      signal.addEventListener("abort", onAbort, { once: true });
    }
  });
}

export default startGenerationJob;
