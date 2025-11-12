import axios from "axios";

export const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://api.example.com",
  timeout: 15000,
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("[API ERROR]", error?.response?.status, error?.message);
    return Promise.reject(error);
  }
);

export default client;
