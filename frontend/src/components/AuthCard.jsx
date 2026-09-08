import React from "react";

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
      {/* Glitch watermark */}
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
          fontFamily: "var(--font-display)",
          color: "var(--color-accent)",
        }}
      >
        💀
      </span>

      <div
        className={`card ${animClass}`}
        style={{
          width: "100%",
          maxWidth: "460px",
          padding: "2.5rem 2.5rem 2.25rem",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* CTM badge */}
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>


          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.6rem",
            fontWeight: 400,
            color: "var(--color-text-primary)",
            margin: "0 0 0.5rem",
            lineHeight: 1.3,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}>
            {title}
          </h1>

          {subtitle && (
            <p style={{
              fontFamily: "var(--font-ui)",
              fontSize: "0.75rem",
              color: "var(--color-text-secondary)",
              margin: 0,
              letterSpacing: "0.02em",
              lineHeight: 1.7,
            }}>
              {subtitle}
            </p>
          )}
        </div>

        {/* Divider */}
        <div style={{
          height: "1px",
          background: "var(--color-border)",
          marginBottom: "1.75rem",
        }} />

        {children}
      </div>
    </div>
  );
}