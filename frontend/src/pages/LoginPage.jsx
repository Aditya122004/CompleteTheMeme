import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginUser } from "../services/api";
import useForm from "../hooks/useForm";
import AuthCard from "../components/AuthCard";
import InputField from "../components/InputField";
import Button from "../components/Button";

// ── Icons ──────────────────────────────────────────────────────
const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="8" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.3" />
    <path d="M2.5 13.5c0-3.038 2.462-5 5.5-5s5.5 1.962 5.5 5"
      stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <rect x="3" y="7" width="10" height="8" rx="2" stroke="currentColor" strokeWidth="1.3" />
    <path d="M5 7V5a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    <circle cx="8" cy="11" r="1.2" fill="currentColor" />
  </svg>
);

const EyeIcon = ({ open }) => open ? (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M1.5 8s2.5-4.5 6.5-4.5S14.5 8 14.5 8s-2.5 4.5-6.5 4.5S1.5 8 1.5 8z"
      stroke="currentColor" strokeWidth="1.3" />
    <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3" />
  </svg>
) : (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M1.5 8s2.5-4.5 6.5-4.5S14.5 8 14.5 8s-2.5 4.5-6.5 4.5S1.5 8 1.5 8z"
      stroke="currentColor" strokeWidth="1.3" />
    <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3" />
    <line x1="2" y1="2" x2="14" y2="14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

// ── Validation ─────────────────────────────────────────────────
function validate(values) {
  const errors = {};
  if (!values.username.trim())       errors.username = "Username is required";
  if (!values.password)              errors.password = "Password is required";
  return errors;
}

// ── Component ──────────────────────────────────────────────────
export default function LoginPage() {
  const navigate    = useNavigate();
  const { login }   = useAuth();
  const [showPw, setShowPw] = useState(false);
  const [apiError, setApiError] = useState("");

  const { values, errors, isSubmitting, handleChange, handleBlur, handleSubmit, setFieldError } =
    useForm(
      { username: "", password: "" },
      validate,
      async (vals) => {
        setApiError("");
        try {
          const res = await loginUser(vals.username.trim(), vals.password);
          // Expect { token: "...", username: "..." } or similar
          const token    = res.data?.token || res.data?.accessToken || res.data?.jwt;
          const username = res.data?.username || vals.username.trim();

          if (!token) {
            setApiError("Unexpected server response — no token received.");
            return;
          }

          login(token, { username });
          navigate("/welcome");
        } catch (err) {
          const status  = err.response?.status;
          const message = err.response?.data?.message || err.response?.data?.error;

          if (status === 401 || status === 403) {
            setFieldError("password", "Invalid username or password");
          } else if (status === 404) {
            setFieldError("username", "No account found with that username");
          } else if (message) {
            setApiError(message);
          } else {
            setApiError("Unable to connect — is the server running?");
          }
        }
      }
    );

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Make your move — the board awaits"
    >
      <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>

        {/* Global API error banner */}
        {apiError && (
          <div
            className="fade-up"
            style={{
              background: "var(--color-error-bg)",
              border: "1px solid var(--color-error)",
              borderRadius: "var(--radius-md)",
              padding: "0.65rem 0.9rem",
              color: "var(--color-error)",
              fontSize: "0.875rem",
              fontFamily: "var(--font-ui)",
            }}
          >
            {apiError}
          </div>
        )}

        <div className="fade-up-delay-1 fade-up">
          <InputField
            id="username"
            name="username"
            label="Username"
            placeholder="e.g. GrandMaster99"
            autoComplete="username"
            autoFocus
            value={values.username}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.username}
            icon={<UserIcon />}
          />
        </div>

        <div className="fade-up-delay-2 fade-up">
          <InputField
            id="password"
            name="password"
            type={showPw ? "text" : "password"}
            label="Password"
            placeholder="Your secret key"
            autoComplete="current-password"
            value={values.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.password}
            icon={<LockIcon />}
            rightSlot={
              <button
                type="button"
                onClick={() => setShowPw((p) => !p)}
                aria-label={showPw ? "Hide password" : "Show password"}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  color: "inherit",
                  display: "flex",
                }}
              >
                <EyeIcon open={showPw} />
              </button>
            }
          />
        </div>

        <div className="fade-up-delay-3 fade-up" style={{ marginTop: "0.25rem" }}>
          <Button type="submit" loading={isSubmitting}>
            {isSubmitting ? "Signing in…" : "Sign In"}
          </Button>
        </div>
      </form>

      <p
        className="fade-up-delay-4 fade-up"
        style={{
          textAlign: "center",
          marginTop: "1.5rem",
          fontFamily: "var(--font-ui)",
          fontSize: "0.875rem",
          color: "var(--color-text-secondary)",
        }}
      >
        New player?{" "}
        <Link
          to="/register"
          style={{
            color: "var(--color-accent)",
            textDecoration: "underline",
            textUnderlineOffset: "3px",
            fontWeight: 500,
          }}
        >
          Create an account
        </Link>
      </p>
    </AuthCard>
  );
}