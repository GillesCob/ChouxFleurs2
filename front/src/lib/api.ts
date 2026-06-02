import { mockFetch } from "./mock-api";

const API_BASE = "/api";
// Passer à false quand le backend sera déployé
export const USE_MOCK = true;

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Erreur réseau" }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) =>
    USE_MOCK
      ? mockFetch<T>("GET", path)
      : fetch(`${API_BASE}${path}`, { headers: getAuthHeaders() }).then(handleResponse<T>),

  post: <T>(path: string, body: unknown) =>
    USE_MOCK
      ? mockFetch<T>("POST", path, body)
      : fetch(`${API_BASE}${path}`, {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(body),
        }).then(handleResponse<T>),

  patch: <T>(path: string, body: unknown) =>
    USE_MOCK
      ? mockFetch<T>("PATCH", path, body)
      : fetch(`${API_BASE}${path}`, {
          method: "PATCH",
          headers: getAuthHeaders(),
          body: JSON.stringify(body),
        }).then(handleResponse<T>),

  delete: <T>(path: string) =>
    USE_MOCK
      ? mockFetch<T>("DELETE", path)
      : fetch(`${API_BASE}${path}`, {
          method: "DELETE",
          headers: getAuthHeaders(),
        }).then(handleResponse<T>),
};
