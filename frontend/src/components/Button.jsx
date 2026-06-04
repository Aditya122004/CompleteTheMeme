import React from "react";

/**
 * Button
 *
 * Props:
 *   loading    — bool, shows spinner + disables
 *   variant    — "primary" (default) | "ghost"
 *   ...rest    — passed to <button>
 */
export default function Button({ loading, children, variant = "primary", style = {}, ...rest }) {
  if (variant === "ghost") {
    return (
      <button
        {...rest}
        style={{
          background: "none",
          border: "none",
          color: "var(--color-accent)",
          fontFamily: "var(--font-ui)",
          fontSize: "0.9rem",
          fontWeight: 500,
          cursor: "pointer",
          padding: "0.25rem 0",
          transition: "color var(--transition)",
          textDecoration: "underline",
          textUnderlineOffset: "3px",
          ...style,
        }}
      >
        {children}
      </button>
    );
  }

  return (
    <button
      className="btn-primary"
      disabled={loading || rest.disabled}
      style={style}
      {...rest}
    >
      {loading ? (
        <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
          <Spinner />
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  );
}

function Spinner() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      style={{ animation: "spin 0.7s linear infinite" }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle
        cx="8" cy="8" r="6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="30"
        strokeDashoffset="10"
      />
    </svg>
  );
}