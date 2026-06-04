import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function WelcomePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div
      className="board-bg"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "2rem",
        padding: "2rem",
      }}
    >
      {/* Decorative piece */}
      <span
        aria-hidden="true"
        className="piece-watermark"
        style={{
          position: "fixed",
          bottom: "-40px",
          right: "-20px",
          fontSize: "320px",
          lineHeight: 1,
          zIndex: 0,
        }}
      >
        💀
      </span>

      <div
        className="card fade-up"
        style={{
          maxWidth: "480px",
          width: "100%",
          padding: "3rem 2.5rem",
          textAlign: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Crown icon */}
        <div style={{ fontSize: "3rem", marginBottom: "1.25rem" }}>🐸</div>

        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "2.8rem",
            fontWeight: 400,
            color: "var(--color-text-primary)",
            margin: "0 0 0.5rem",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            lineHeight: 1.1,
          }}
        >
          Welcome,{" "}
          <span style={{ color: "var(--color-accent)" }}>
            {user?.username ?? "Player"}
          </span>
          !
        </h1>

        <p
          style={{
            fontFamily: "var(--font-ui)",
            fontSize: "0.8rem",
            color: "var(--color-text-secondary)",
            margin: "0 0 2rem",
            lineHeight: 1.7,
            letterSpacing: "0.02em",
          }}
        >
          You're in. The memes are set, the clock is ticking.
          <br />
          Your quiz will appear here.
        </p>

        {/* Placeholder — quiz content goes here */}
        <div
          style={{
            border: "1px dashed var(--color-border)",
            borderRadius: "var(--radius-md)",
            padding: "1.5rem",
            color: "var(--color-text-muted)",
            fontFamily: "var(--font-ui)",
            fontSize: "0.875rem",
            marginBottom: "2rem",
          }}
        >
          🧩 Quiz content coming soon…
        </div>

        <button
          onClick={handleLogout}
          style={{
            background: "none",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            color: "var(--color-text-secondary)",
            fontFamily: "var(--font-ui)",
            fontSize: "0.875rem",
            padding: "0.6rem 1.25rem",
            cursor: "pointer",
            transition: "border-color var(--transition), color var(--transition)",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.borderColor = "var(--color-accent)";
            e.currentTarget.style.color = "var(--color-accent)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.borderColor = "var(--color-border)";
            e.currentTarget.style.color = "var(--color-text-secondary)";
          }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}