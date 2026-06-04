/**
 * CompleteTheMeme — Theme Configuration
 *
 * Change the theme here. Each key maps to a CSS custom property
 * injected via ThemeProvider into :root. Swap activeTheme to any
 * preset key below, or add your own.
 */

export const themes = {
  memecore: {
    // Core palette — deep void black + neon yellow chaos
    "--color-bg-base":        "#0a0a0a",   // void black
    "--color-bg-surface":     "#111111",   // slightly lifted surface
    "--color-bg-elevated":    "#181818",   // cards / panels
    "--color-bg-input":       "#0f0f0f",   // input fields

    "--color-border":         "#2a2a2a",   // near-invisible border
    "--color-border-focus":   "#e8ff00",   // screaming neon yellow

    "--color-text-primary":   "#f0f0f0",   // near-white
    "--color-text-secondary": "#888888",   // mid grey
    "--color-text-muted":     "#444444",   // dim

    "--color-accent":         "#e8ff00",   // neon yellow — THE colour
    "--color-accent-hover":   "#f5ff4d",   // lighter neon on hover
    "--color-accent-text":    "#0a0a0a",   // black text on neon buttons

    "--color-error":          "#ff4444",   // hot red
    "--color-error-bg":       "#1a0808",   // dark red tint
    "--color-success":        "#00ff88",   // neon green

    // Typography — Impact for display, Space Mono for UI (terminal-like)
    "--font-display":         "'Bangers', 'Impact', sans-serif",
    "--font-body":            "'Space Mono', monospace",
    "--font-ui":              "'Space Mono', monospace",

    // Shape — sharper corners for a jagged, internet feel
    "--radius-sm":            "2px",
    "--radius-md":            "4px",
    "--radius-lg":            "6px",

    // Misc
    "--transition":           "0.12s ease",
    "--shadow-card":          "0 0 0 1px #e8ff0022, 0 8px 40px rgba(0,0,0,0.8)",
    "--shadow-input-focus":   "0 0 0 3px rgba(232,255,0,0.2)",

    // Background noise vars (used in .board-bg)
    "--bg-dot-color":         "#e8ff0009",
  },

  chess: {
    "--color-bg-base":        "#1a1208",
    "--color-bg-surface":     "#241a0e",
    "--color-bg-elevated":    "#2e2210",
    "--color-bg-input":       "#1f1709",
    "--color-border":         "#4a3520",
    "--color-border-focus":   "#c9a84c",
    "--color-text-primary":   "#f5ecd7",
    "--color-text-secondary": "#a08c68",
    "--color-text-muted":     "#6b5a42",
    "--color-accent":         "#c9a84c",
    "--color-accent-hover":   "#e0bf6a",
    "--color-accent-text":    "#1a1208",
    "--color-error":          "#e05252",
    "--color-error-bg":       "#2d1010",
    "--color-success":        "#52b788",
    "--font-display":         "'Playfair Display', Georgia, serif",
    "--font-body":            "'Crimson Pro', Georgia, serif",
    "--font-ui":              "'DM Sans', system-ui, sans-serif",
    "--radius-sm":            "4px",
    "--radius-md":            "8px",
    "--radius-lg":            "12px",
    "--transition":           "0.18s ease",
    "--shadow-card":          "0 8px 32px rgba(0,0,0,0.55)",
    "--shadow-input-focus":   "0 0 0 3px rgba(201,168,76,0.25)",
    "--bg-dot-color":         "#c9a84c22",
  },

  // ── Add more themes here ────────────────────────────────────────
  // pastel: { "--color-bg-base": "#fef9f0", ... },
};

/** The active theme key — change this to switch themes */
export const activeTheme = "memecore";