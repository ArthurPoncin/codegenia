import client from "@/api/client.js";

// Voir docs/04_api_endpoints.md — POST /sell
export async function sellPokemon(pokemonId, config = {}) {
  if (!pokemonId) {
    throw new Error("sellPokemon requires a pokemonId");
  }

  const response = await client.post(
    "/sell",
    { pokemonId },
    config
  );
  return response.data;
}

export default sellPokemon;
