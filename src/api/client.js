import axios from "axios";
import { ApiError } from "@/api/errors.js";

const DEFAULT_BASE_URL = "https://api.pokeforge.example.com/v1";

// Voir docs/04_api_endpoints.md — conventions générales & auth
export const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || DEFAULT_BASE_URL,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

client.interceptors.request.use((config) => {
  const apiKey = import.meta.env.VITE_API_KEY;
  if (apiKey) {
    config.headers = config.headers ?? {};
    if (!config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${apiKey}`;
    }
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    const normalizedError = normalizeAxiosError(error);

    console.error(
      "[API ERROR]",
      normalizedError.status ?? "NETWORK",
      normalizedError.code,
      normalizedError.message
    );

    return Promise.reject(normalizedError);
  }
);

function normalizeAxiosError(error) {
  const { response } = error;

  if (!response) {
    return new ApiError({
      code: "NETWORK_ERROR",
      message: error.message || "Network request failed",
      cause: error,
    });
  }

  const payload = response.data?.error ?? {};

  return new ApiError({
    status: response.status,
    code: payload.code ?? `HTTP_${response.status}`,
    message: payload.message ?? error.message ?? "Request failed",
    details: payload.details ?? response.data,
    traceId: payload.traceId ?? response.headers?.["x-trace-id"],
    cause: error,
  });
}

export default client;
