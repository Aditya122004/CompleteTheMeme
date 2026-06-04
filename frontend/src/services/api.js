import axios from "axios";

const BASE_URL = "http://localhost:5000";

/** Shared axios instance — base URL pre-configured */
const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

/**
 * Attach a Bearer token to every outgoing request when one exists in
 * localStorage. This means you never have to pass headers manually for
 * protected routes — just import `api` and call it.
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ctm_jwt_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Auth endpoints ─────────────────────────────────────────────

/**
 * Register a new user.
 * @param {string} username
 * @param {string} password
 * @returns {Promise<AxiosResponse>}
 */
export const registerUser = (username, password) =>
  api.post("/api/auth/register", { username, password });

/**
 * Log in with credentials.
 * @param {string} username
 * @param {string} password
 * @returns {Promise<AxiosResponse>} — response.data should contain { token, ... }
 */
export const loginUser = (username, password) =>
  api.post("/api/auth/login", { username, password });

export default api;