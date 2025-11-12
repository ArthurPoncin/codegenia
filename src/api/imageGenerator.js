import client from "@/api/client.js";

export async function generatePokemonImage(payload) {
  const response = await client.post("/generate", payload);
  return response.data;
}

export default generatePokemonImage;
