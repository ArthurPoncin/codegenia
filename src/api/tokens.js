import client from "@/api/client.js";

// Voir docs/04_api_endpoints.md — GET /tokens/balance
export async function fetchTokenBalance(config = {}) {
  const response = await client.get("/tokens/balance", config);
  return response.data;
}

export default fetchTokenBalance;
