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
 * Log in with roll number and password.
 * @param {string} rollNo
 * @param {string} password
 * @returns {Promise<AxiosResponse>} — response.data contains { token, user: { rollNo, ... } }
 */
export const loginUser = (rollNo, password) =>
  api.post("/api/auth/login", { rollNo, password });

// ── Quiz endpoints ─────────────────────────────────────────────

/** Fetch all quiz questions */
export const getQuestions = () =>
  api.get("/api/quiz/questions");

/**
 * Check a single answer.
 * @param {string} questionId
 * @param {string} answer
 */
export const checkAnswer = (questionId, answer) =>
  api.post("/api/quiz/check-answer", { questionId, answer });

/**
 * Submit all answers for scoring.
 * @param {Array<{questionId: string, answer: string}>} answers
 */
export const submitQuiz = (answers) =>
  api.post("/api/quiz/submit", { answers });

export default api;