import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Arcade SVG icons — no emojis
const IconTimer = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
    <circle cx="11" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
    <path d="M11 8v4l2.5 2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M8.5 2.5h5M11 2.5v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const IconLock = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
    <rect x="4" y="10" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
    <path d="M7 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="11" cy="15" r="1.5" fill="currentColor" />
  </svg>
);

const IconBrain = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
    <path d="M8 19c0-1.5-2-2-3-3.5A5 5 0 0 1 8 7a3 3 0 0 1 6 0 5 5 0 0 1 3 8.5C16 17 14 17.5 14 19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M9 19h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M11 7v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M8.5 10.5l2.5 1.5 2.5-1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const rules = [
  { Icon: IconTimer, label: "60 SEC",     sub: "per question" },
  { Icon: IconLock,  label: "1 ATTEMPT",  sub: "make it count" },
  { Icon: IconBrain, label: "MEME IQ",    sub: "being tested" },
];

export default function WelcomePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
      {/* Arcade watermark SVG */}
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
          maxWidth: "500px",
          width: "100%",
          padding: "3rem 2.5rem",
          textAlign: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        <h1 style={{
          fontFamily: "var(--font-display)",
          fontSize: "2.2rem",
          fontWeight: 400,
          color: "var(--color-text-primary)",
          margin: "0 0 0.6rem",
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          lineHeight: 1.2,
        }}>
          PLAYER{" "}
          <span style={{ color: "var(--color-accent)" }}>
            {user?.rollNo ?? "—"}
          </span>
        </h1>

        <p style={{
          fontFamily: "var(--font-ui)",
          fontSize: "0.95rem",
          color: "var(--color-text-secondary)",
          margin: "0 0 2.5rem",
          lineHeight: 1.7,
        }}>
          The memes are loaded. The clock is armed.<br />
          One shot. No retries.
        </p>

        {/* Rules strip */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "0.75rem",
          marginBottom: "2.5rem",
        }}>
          {rules.map(({ Icon, label, sub }) => (
            <div key={label} style={{
              background: "var(--color-bg-input)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              padding: "1.1rem 0.5rem 1rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.5rem",
            }}>
              <span style={{ color: "var(--color-accent)" }}><Icon /></span>
              <div style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.1rem",
                color: "var(--color-text-primary)",
                letterSpacing: "0.05em",
                lineHeight: 1.2,
              }}>{label}</div>
              <div style={{
                fontFamily: "var(--font-ui)",
                fontSize: "0.75rem",
                color: "var(--color-text-muted)",
              }}>{sub}</div>
            </div>
          ))}
        </div>

        <button
          className="btn-primary"
          onClick={() => navigate("/quiz")}
          style={{ marginBottom: "1.25rem" }}
        >
          INSERT COIN
        </button>

        <button
          onClick={() => { logout(); navigate("/login"); }}
          style={{
            background: "none",
            border: "none",
            color: "var(--color-text-muted)",
            fontFamily: "var(--font-ui)",
            fontSize: "0.75rem",
            cursor: "pointer",
            letterSpacing: "0.03em",
            padding: "0.25rem",
            textDecoration: "underline",
            textUnderlineOffset: "3px",
          }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}