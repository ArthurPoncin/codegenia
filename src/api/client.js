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

const baseURL = resolveEnv("VITE_API_BASE_URL") ?? "https://epsi.journeesdecouverte.fr:22222/v1/generate";

const client = axios.create({
  baseURL,
  timeout: 20000,
  headers: { "Content-Type": "application/json" },
});

client.interceptors.request.use((config) => {
  const apiKey = resolveEnv("EPSI");
  if (apiKey) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${apiKey}`;
  }
  return config;
});

export default client;
