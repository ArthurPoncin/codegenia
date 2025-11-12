import axios from "axios";

function resolveEnv(key) {
  if (typeof import.meta !== "undefined" && import.meta.env && key in import.meta.env) {
    return import.meta.env[key];
  }
  if (typeof process !== "undefined" && process.env && key in process.env) {
    return process.env[key];
  }
  return undefined;
}

const baseURL = resolveEnv("VITE_API_BASE_URL") ?? "https://api.pokeforge.test";

const client = axios.create({
  baseURL,
  timeout: 20000,
  headers: { "Content-Type": "application/json" },
});

client.interceptors.request.use((config) => {
  const apiKey = resolveEnv("VITE_API_KEY");
  if (apiKey) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${apiKey}`;
  }
  return config;
});

export default client;
