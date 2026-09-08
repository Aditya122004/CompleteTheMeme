import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Arcade-style trophy SVG
const TrophyIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
    <path d="M16 6h16v16a8 8 0 0 1-16 0V6Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
    <path d="M16 10H8a4 4 0 0 0 0 8h8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M32 10h8a4 4 0 0 1 0 8h-8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M24 30v8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M16 42h16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

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
      {/* Arcade watermark */}
      <svg
        aria-hidden="true"
        viewBox="0 0 200 200"
        className="piece-watermark"
        style={{
          position: "fixed",
          bottom: "-30px",
          right: "-30px",
          width: "340px",
          height: "340px",
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        <rect x="20" y="100" width="160" height="80" rx="20" fill="currentColor" />
        <rect x="55" y="115" width="30" height="50" rx="6" fill="var(--color-bg-elevated)" />
        <circle cx="70" cy="108" r="14" fill="var(--color-bg-elevated)" />
        <circle cx="130" cy="130" r="12" fill="var(--color-bg-elevated)" />
        <circle cx="155" cy="145" r="10" fill="var(--color-bg-elevated)" />
        <circle cx="130" cy="158" r="10" fill="var(--color-bg-elevated)" />
        <circle cx="107" cy="145" r="10" fill="var(--color-bg-elevated)" />
      </svg>

      <div
        className="card fade-up"
        style={{
          maxWidth: "480px",
          width: "100%",
          padding: "3.5rem 2.5rem",
          textAlign: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ color: "var(--color-accent)", marginBottom: "1.25rem", display: "flex", justifyContent: "center" }}>
          <TrophyIcon />
        </div>

        <h1 style={{
          fontFamily: "var(--font-display)",
          fontSize: "1rem",
          fontWeight: 400,
          color: "var(--color-accent)",
          margin: "0 0 0.75rem",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          lineHeight: 1.5,
        }}>
          GAME OVER
        </h1>

        <p style={{
          fontFamily: "var(--font-ui)",
          fontSize: "0.85rem",
          color: "var(--color-text-secondary)",
          margin: "0 0 2rem",
          lineHeight: 1.8,
        }}>
          Thanks for playing,{" "}
          <span style={{ color: "var(--color-text-primary)", fontWeight: 700 }}>
            {user?.rollNo ?? "player"}
          </span>
          .<br />
          Your answers have been submitted.<br />
          Scores are with the host only.
        </p>

        <div style={{
          height: "2px",
          background: "var(--color-accent)",
          marginBottom: "2rem",
          borderRadius: "1px",
          opacity: 0.5,
        }} />

        <button
          className="btn-primary"
          onClick={() => navigate("/welcome")}
          style={{ marginBottom: "1rem" }}
        >
          BACK TO HOME
        </button>

        <p style={{
          fontFamily: "var(--font-ui)",
          fontSize: "0.72rem",
          color: "var(--color-text-muted)",
          margin: 0,
          lineHeight: 1.6,
        }}>
          You can only attempt the quiz once.
        </p>
      </div>
    </div>
  );
}