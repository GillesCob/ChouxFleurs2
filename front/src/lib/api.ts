const API_BASE = "/api";

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
    fetch(`${API_BASE}${path}`, { headers: getAuthHeaders() }).then(
      handleResponse<T>
    ),

  post: <T>(path: string, body: unknown) =>
    fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    }).then(handleResponse<T>),

  patch: <T>(path: string, body: unknown) =>
    fetch(`${API_BASE}${path}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    }).then(handleResponse<T>),

  delete: <T>(path: string) =>
    fetch(`${API_BASE}${path}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    }).then(handleResponse<T>),
};
