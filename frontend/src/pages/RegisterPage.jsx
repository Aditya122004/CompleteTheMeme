import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../services/api";
import useForm from "../hooks/useForm";
import AuthCard from "../components/AuthCard";
import InputField from "../components/InputField";
import Button from "../components/Button";

// ── Icons (same as Login; in a larger app, extract to icons.jsx) ─
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

// ── Strength meter helper ──────────────────────────────────────
function passwordStrength(pw) {
  if (!pw) return { level: 0, label: "", color: "transparent" };
  let score = 0;
  if (pw.length >= 8)             score++;
  if (/[A-Z]/.test(pw))          score++;
  if (/[0-9]/.test(pw))          score++;
  if (/[^A-Za-z0-9]/.test(pw))   score++;

  const map = [
    { level: 0, label: "",         color: "transparent" },
    { level: 1, label: "Weak",     color: "var(--color-error)" },
    { level: 2, label: "Fair",     color: "#e0963d" },
    { level: 3, label: "Good",     color: "#c9a84c" },
    { level: 4, label: "Strong",   color: "var(--color-success)" },
  ];
  return map[score] ?? map[0];
}

// ── Validation ─────────────────────────────────────────────────
function validate(values) {
  const errors = {};
  if (!values.username.trim()) {
    errors.username = "Username is required";
  } else if (values.username.trim().length < 3) {
    errors.username = "Username must be at least 3 characters";
  } else if (!/^[A-Za-z0-9_]+$/.test(values.username.trim())) {
    errors.username = "Only letters, numbers, and underscores";
  }

  if (!values.password) {
    errors.password = "Password is required";
  } else if (values.password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = "Please confirm your password";
  } else if (values.password !== values.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  return errors;
}

// ── Component ──────────────────────────────────────────────────
export default function RegisterPage() {
  const navigate  = useNavigate();
  const [showPw,  setShowPw]  = useState(false);
  const [showCPw, setShowCPw] = useState(false);
  const [apiError, setApiError] = useState("");

  const { values, errors, isSubmitting, handleChange, handleBlur, handleSubmit, setFieldError } =
    useForm(
      { username: "", password: "", confirmPassword: "" },
      validate,
      async (vals) => {
        setApiError("");
        try {
          await registerUser(vals.username.trim(), vals.password);
          navigate("/login", { state: { registered: true } });
        } catch (err) {
          const status  = err.response?.status;
          const message = err.response?.data?.message || err.response?.data?.error;

          if (status === 409 || message?.toLowerCase().includes("exist")) {
            setFieldError("username", "This username is already taken");
          } else if (message) {
            setApiError(message);
          } else {
            setApiError("Unable to connect — is the server running?");
          }
        }
      }
    );

  const strength = passwordStrength(values.password);

  return (
    <AuthCard
      title="Create account"
      subtitle="Join the game — it's your opening move"
    >
      <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>

        {/* Global API error */}
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
            placeholder="Pick your player name"
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
            placeholder="At least 6 characters"
            autoComplete="new-password"
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
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "inherit", display: "flex" }}
              >
                <EyeIcon open={showPw} />
              </button>
            }
          />

          {/* Password strength bar */}
          {values.password && (
            <div style={{ marginTop: "0.4rem" }}>
              <div style={{
                height: "3px",
                borderRadius: "2px",
                background: "var(--color-border)",
                overflow: "hidden",
              }}>
                <div style={{
                  height: "100%",
                  width: `${(strength.level / 4) * 100}%`,
                  background: strength.color,
                  borderRadius: "2px",
                  transition: "width 0.3s ease, background 0.3s ease",
                }} />
              </div>
              {strength.label && (
                <p style={{
                  fontSize: "0.75rem",
                  color: strength.color,
                  fontFamily: "var(--font-ui)",
                  margin: "0.2rem 0 0",
                }}>
                  {strength.label} password
                </p>
              )}
            </div>
          )}
        </div>

        <div className="fade-up-delay-3 fade-up">
          <InputField
            id="confirmPassword"
            name="confirmPassword"
            type={showCPw ? "text" : "password"}
            label="Confirm password"
            placeholder="Repeat your password"
            autoComplete="new-password"
            value={values.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.confirmPassword}
            icon={<LockIcon />}
            rightSlot={
              <button
                type="button"
                onClick={() => setShowCPw((p) => !p)}
                aria-label={showCPw ? "Hide password" : "Show password"}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "inherit", display: "flex" }}
              >
                <EyeIcon open={showCPw} />
              </button>
            }
          />
        </div>

        <div className="fade-up-delay-4 fade-up" style={{ marginTop: "0.25rem" }}>
          <Button type="submit" loading={isSubmitting}>
            {isSubmitting ? "Creating account…" : "Create Account"}
          </Button>
        </div>
      </form>

      <p
        className="fade-up-delay-5 fade-up"
        style={{
          textAlign: "center",
          marginTop: "1.5rem",
          fontFamily: "var(--font-ui)",
          fontSize: "0.875rem",
          color: "var(--color-text-secondary)",
        }}
      >
        Already have an account?{" "}
        <Link
          to="/login"
          style={{
            color: "var(--color-accent)",
            textDecoration: "underline",
            textUnderlineOffset: "3px",
            fontWeight: 500,
          }}
        >
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}