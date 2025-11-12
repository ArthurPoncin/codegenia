import {
  startGenerationJob,
  getGenerationJob,
  pollGenerationJob,
} from "@/api/generation.js";

// Compatibilité historique : alias vers startGenerationJob
export async function generatePokemonImage(payload, options) {
  return startGenerationJob(payload, options);
}

export { startGenerationJob, getGenerationJob, pollGenerationJob };

export default generatePokemonImage;
