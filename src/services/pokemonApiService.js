const API_BASE_URL = "https://pokeapi.co/api/v2";
const REQUEST_TIMEOUT = 20000;
const MAX_POKEMON_ID = 1025;

const rarityRanges = [
  { threshold: 240, value: "legendary" },
  { threshold: 200, value: "epic" },
  { threshold: 120, value: "rare" },
  { threshold: 0, value: "common" },
];

function normalizePokemonName(value) {
  if (!value || typeof value !== "string") return "";
  return value.trim().toLowerCase().replace(/\s+/g, "-");
}

function titleizePokemonName(name) {
  if (!name) return "Pokémon";
  return name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function pickImageUrl(data) {
  return (
    data?.sprites?.other?.["official-artwork"]?.front_default ||
    data?.sprites?.other?.dream_world?.front_default ||
    data?.sprites?.front_default ||
    ""
  );
}

function resolveRarity({ baseExperience = 0, species } = {}) {
  if (species?.is_legendary) return "legendary";
  if (species?.is_mythical) return "epic";

  for (const range of rarityRanges) {
    if (baseExperience >= range.threshold) {
      return range.value;
    }
  }
  return "common";
}

function extractIdentifier({ pokemonId, pokemonName, prompt }) {
  if (pokemonId && Number.isFinite(Number(pokemonId))) {
    return { value: Number(pokemonId), type: "id" };
  }

  const directName = normalizePokemonName(pokemonName);
  if (directName) {
    return { value: directName, type: "name" };
  }

  if (typeof prompt === "string" && prompt.trim()) {
    const matchById = prompt.match(/#(\d{1,4})/);
    if (matchById) {
      return { value: Number(matchById[1]), type: "id" };
    }

    const nameCandidate = normalizePokemonName(prompt.split(/\s+/)[0]);
    if (/^[a-z0-9-]+$/.test(nameCandidate)) {
      return { value: nameCandidate, type: "name" };
    }
  }

  return { value: randomPokemonId(), type: "random" };
}

function randomPokemonId() {
  return Math.floor(Math.random() * MAX_POKEMON_ID) + 1;
}

async function fetchJsonOrThrow(url, signal) {
  const response = await fetch(url, { signal, mode: "cors" });
  if (!response.ok) {
    const message = response.status === 404 ? "Pokémon introuvable." : `Erreur API (HTTP ${response.status}).`;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }
  return response.json();
}

export async function generatePokemonFromApi({ prompt, pokemonId, pokemonName, signal } = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  const combinedSignal = signal
    ? mergeAbortSignals(signal, controller.signal)
    : controller.signal;

  try {
    const identifier = extractIdentifier({ pokemonId, pokemonName, prompt });
    let pokemonData;

    try {
      pokemonData = await fetchJsonOrThrow(`${API_BASE_URL}/pokemon/${identifier.value}`, combinedSignal);
    } catch (error) {
      if (identifier.type === "name" && error.status === 404) {
        const fallbackId = randomPokemonId();
        pokemonData = await fetchJsonOrThrow(`${API_BASE_URL}/pokemon/${fallbackId}`, combinedSignal);
      } else {
        throw error;
      }
    }

    const speciesUrl = pokemonData?.species?.url || `${API_BASE_URL}/pokemon-species/${pokemonData.id}`;
    const speciesData = await fetchJsonOrThrow(speciesUrl, combinedSignal);

    const imageUrl = pickImageUrl(pokemonData);
    if (!imageUrl) {
      throw new Error("Aucune image disponible pour ce Pokémon.");
    }

    return {
      id: pokemonData.id,
      name: titleizePokemonName(pokemonData.name),
      rarity: resolveRarity({ baseExperience: pokemonData.base_experience ?? 0, species: speciesData }),
      imageUrl,
      generatedAt: new Date().toISOString(),
      status: "OWNED",
      prompt,
    };
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error(
        `La requête PokéAPI a expiré après ${REQUEST_TIMEOUT / 1000} secondes. Merci de réessayer.`
      );
    }

    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error(
        "Impossible de contacter PokéAPI. Vérifie ta connexion réseau ou réessaie plus tard."
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
