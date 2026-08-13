import React from "react";

/**
 * AuthCard
 *
 * The shared card shell for auth pages.
 * Renders the chess-board background, a centred card, the logo/title,
 * and a slot for the form content.
 *
 * Props:
 *   title       — main heading (string)
 *   subtitle    — muted line below heading (string | JSX)
 *   children    — form content
 *   animClass   — extra CSS class for entrance animation (optional)
 */
export default function AuthCard({ title, subtitle, children, animClass = "fade-up" }) {
  return (
    <div
      className="board-bg"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1rem",
      }}
    >
      {/* Decorative watermark — giant glitchy lol */}
      <span
        className="piece-watermark"
        aria-hidden="true"
        style={{
          position: "fixed",
          bottom: "-40px",
          right: "-20px",
          fontSize: "320px",
          lineHeight: 1,
          zIndex: 0,
          userSelect: "none",
        }}
      >
      </span>

      <div
        className={`card ${animClass}`}
        style={{
          width: "100%",
          maxWidth: "440px",
          padding: "2.75rem 2.5rem 2.25rem",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Logo / brand */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              marginBottom: "1.1rem",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "2rem",
                fontWeight: 400,
                color: "var(--color-accent)",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              Complete The Meme
            </span>
          </div>

          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "2.2rem",
              fontWeight: 400,
              color: "var(--color-text-primary)",
              margin: "0 0 0.4rem",
              lineHeight: 1.1,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            {title}
          </h1>

          {subtitle && (
            <p
              style={{
                fontFamily: "var(--font-ui)",
                fontSize: "0.75rem",
                color: "var(--color-text-secondary)",
                margin: 0,
                letterSpacing: "0.04em",
              }}
            >
              {subtitle}
            </p>
          )}
        </div>

        {/* Thin gold divider */}
        <div
          style={{
            height: "1px",
            background: "linear-gradient(90deg, transparent, var(--color-accent), transparent)",
            marginBottom: "1.75rem",
            opacity: 0.45,
          }}
        />

        {children}
      </div>
    </div>
  );
}