const API_BASE_URL = "https://epsi.journeesdecouverte.fr:22222/v1";
const AUTH_TOKEN = "EPSI";
const REQUEST_TIMEOUT = 30000;

function buildImageUrl(imageBase64) {
  if (!imageBase64) return "";
  if (imageBase64.startsWith("data:")) {
    return imageBase64;
  }
  return `data:image/png;base64,${imageBase64}`;
}

async function parseErrorResponse(response) {
  try {
    const data = await response.json();
    const message = data?.error?.message || data?.message;
    if (message) {
      return new Error(message);
    }
  } catch (error) {
    // ignore JSON parsing errors and fall back to generic message
  }
  return new Error(`Failed to generate Pokémon (HTTP ${response.status})`);
}

export async function generatePokemonFromApi({ signal } = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  const combinedSignal = signal
    ? mergeAbortSignals(signal, controller.signal)
    : controller.signal;

  try {
    const response = await fetch(`${API_BASE_URL}/generate`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`,
      },
      mode: "cors",
      signal: combinedSignal,
    });

    if (!response.ok) {
      throw await parseErrorResponse(response);
    }

    const data = await response.json();

    if (
      !data ||
      !data.imageBase64 ||
      !data.metadata ||
      !data.metadata.id ||
      !data.metadata.name ||
      !data.metadata.rarity ||
      !data.generatedAt
    ) {
      throw new Error(
        "Invalid API response format received: missing expected fields."
      );
    }

    return {
      id: data.metadata.id,
      name: data.metadata.name,
      rarity: data.metadata.rarity,
      imageBase64: buildImageUrl(data.imageBase64),
      generatedAt: data.generatedAt,
      status: "OWNED",
    };
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error(
        `The Pokémon generation request timed out after ${REQUEST_TIMEOUT / 1000} seconds. The API might be busy, please try again later.`
      );
    }

    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error(
        "Could not connect to the Pokémon API. This might be a network issue, the API server being down, or a self-signed HTTPS certificate. If the API uses a self-signed certificate, please try opening " +
          `${API_BASE_URL}/generate` +
          " in a new browser tab and accepting the security warning, then refresh this page. Also, verify the API server has correct CORS configuration for your client application's origin."
      );
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

function mergeAbortSignals(signalA, signalB) {
  if (!signalA) return signalB;
  if (!signalB) return signalA;

  const controller = new AbortController();

  const onAbort = () => {
    if (!controller.signal.aborted) {
      controller.abort();
    }
  };

  signalA.addEventListener("abort", onAbort, { once: true });
  signalB.addEventListener("abort", onAbort, { once: true });

  controller.signal.addEventListener(
    "abort",
    () => {
      signalA.removeEventListener("abort", onAbort);
      signalB.removeEventListener("abort", onAbort);
    },
    { once: true }
  );

  if (signalA.aborted || signalB.aborted) {
    controller.abort();
  }

  return controller.signal;
}

export default { generatePokemon: generatePokemonFromApi };
