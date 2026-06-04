import React, { forwardRef } from "react";

/**
 * InputField
 *
 * Props:
 *   label       — string label above the field
 *   error       — string error message (shown below field, red)
 *   icon        — JSX element rendered inside the left of the field
 *   rightSlot   — JSX element rendered inside the right of the field (e.g. show/hide toggle)
 *   ...rest     — passed straight to <input>
 */
const InputField = forwardRef(function InputField(
  { label, error, icon, rightSlot, className = "", ...rest },
  ref
) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
      {label && (
        <label
          htmlFor={rest.id}
          style={{
            fontFamily: "var(--font-ui)",
            fontSize: "0.8125rem",
            fontWeight: 500,
            color: "var(--color-text-secondary)",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </label>
      )}

      {/* Wrapper provides the relative context for icons */}
      <div style={{ position: "relative" }}>
        {icon && (
          <span
            style={{
              position: "absolute",
              left: "0.875rem",
              top: "50%",
              transform: "translateY(-50%)",
              color: error ? "var(--color-error)" : "var(--color-text-muted)",
              display: "flex",
              alignItems: "center",
              pointerEvents: "none",
            }}
          >
            {icon}
          </span>
        )}

        <input
          ref={ref}
          className={`input-field ${error ? "error" : ""} ${className}`}
          style={{
            paddingLeft: icon ? "2.625rem" : undefined,
            paddingRight: rightSlot ? "2.75rem" : undefined,
          }}
          {...rest}
        />

        {rightSlot && (
          <span
            style={{
              position: "absolute",
              right: "0.875rem",
              top: "50%",
              transform: "translateY(-50%)",
              display: "flex",
              alignItems: "center",
              color: "var(--color-text-muted)",
            }}
          >
            {rightSlot}
          </span>
        )}
      </div>

      {error && (
        <p className="error-msg">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
            <circle cx="6.5" cy="6.5" r="6" stroke="currentColor" strokeWidth="1.2" />
            <path d="M6.5 3.8v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            <circle cx="6.5" cy="9.2" r="0.7" fill="currentColor" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
});

export default InputField;