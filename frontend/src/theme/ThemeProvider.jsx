import { useEffect } from "react";
import { themes, activeTheme } from "./theme";

/**
 * ThemeProvider
 *
 * Reads the `activeTheme` key from theme.js and writes every CSS variable
 * onto document.documentElement so all components can consume them via
 * `var(--color-*)` etc.
 *
 * To change the theme, open theme/theme.js and update `activeTheme`.
 */
export default function ThemeProvider({ children }) {
  useEffect(() => {
    const vars = themes[activeTheme] ?? themes.chess;
    const root = document.documentElement;
    Object.entries(vars).forEach(([prop, value]) => {
      root.style.setProperty(prop, value);
    });
  }, []);

  return children;
}