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
        height: "100dvh", // Exact viewport lock
        boxSizing: "border-box",
        overflow: "hidden", // Prevent any layout or window scrolling
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        padding: "1.5rem",
      }}
    >
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
          userSelect: "none",
          pointerEvents: "none",
        }}
      >
      </span>

      <div
        className="card fade-up"
        style={{
          maxWidth: "520px",
          width: "100%",
          padding: "2.5rem 2rem",
          textAlign: "center",
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1.25rem", // Standardizes the inner gap between components cleanly
        }}
      >

        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "2.8rem",
            fontWeight: 400,
            color: "var(--color-text-primary)",
            margin: 0,
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

        {/* Start button */}
        <button
          className="btn-primary"
          onClick={() => navigate("/quiz")}
          style={{ margin: 0, width: "100%" }}
        >
          START QUIZ
        </button>

        <button
          onClick={handleLogout}
          style={{
            background: "none",
            border: "none",
            color: "var(--color-text-muted)",
            fontFamily: "var(--font-ui)",
            fontSize: "0.7rem",
            cursor: "pointer",
            letterSpacing: "0.04em",
            padding: "0.25rem",
            textDecoration: "underline",
            textUnderlineOffset: "3px",
            margin: 0,
          }}
        >
          sign out
        </button>
      </div>
    </div>
  );
}