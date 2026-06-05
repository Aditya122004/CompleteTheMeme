import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function FinishPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div
      className="board-bg"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      {/* Watermark */}
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
          maxWidth: "520px",
          width: "100%",
          padding: "3.5rem 2.5rem",
          textAlign: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Confetti-ish emoji row */}
        <div style={{ fontSize: "2.2rem", marginBottom: "1.25rem", letterSpacing: "0.2em" }}>
          🎉🐸🎉
        </div>

        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "3rem",
            fontWeight: 400,
            color: "var(--color-accent)",
            margin: "0 0 0.5rem",
            letterSpacing: "0.07em",
            textTransform: "uppercase",
            lineHeight: 1.05,
          }}
        >
          That's a wrap!
        </h1>

        <p
          style={{
            fontFamily: "var(--font-ui)",
            fontSize: "0.78rem",
            color: "var(--color-text-secondary)",
            margin: "0 0 2rem",
            lineHeight: 1.8,
            letterSpacing: "0.02em",
          }}
        >
          thanks for playing,{" "}
          <span style={{ color: "var(--color-text-primary)", fontWeight: 700 }}>
            {user?.username ?? "player"}
          </span>
          .<br />
          your answers have been submitted.<br />
        </p>

        {/* Thin neon divider */}
        <div
          style={{
            height: "1px",
            background: "linear-gradient(90deg, transparent, var(--color-accent), transparent)",
            marginBottom: "2rem",
            opacity: 0.4,
          }}
        />

        {/* "Play again" — goes back to welcome but quiz is blocked by backend */}
        <button
          className="btn-primary"
          onClick={() => navigate("/welcome")}
          style={{ marginBottom: "0.85rem" }}
        >
          BACK TO HOME
        </button>
      </div>
    </div>
  );
}