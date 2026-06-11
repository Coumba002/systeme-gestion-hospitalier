import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "kdg-theme";

function getInitialTheme() {
  if (typeof window === "undefined") return "light";
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "dark" || saved === "light") return saved;
  // Fallback : préférence système
  if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
}

/**
 * Hook pour gérer le thème clair/sombre.
 * Applique data-theme="dark" sur <html> et persiste dans localStorage.
 */
export function useTheme() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme(t => t === "dark" ? "light" : "dark");
  }, []);

  return { theme, setTheme, toggle, isDark: theme === "dark" };
}

/**
 * Composant bouton réutilisable
 */
export function ThemeToggle({ size = 36 }) {
  const { isDark, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      title={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
      aria-label={isDark ? "Mode clair" : "Mode sombre"}
      style={{
        width: size, height: size,
        background: isDark ? "#2d3a4a" : "#f0f4f8",
        border: "1px solid " + (isDark ? "#3d4a5a" : "#e8edf2"),
        borderRadius: 10,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: Math.round(size * 0.45),
        color: isDark ? "#fbbf24" : "#4a6070",
        transition: "background 0.2s, color 0.2s, transform 0.15s",
      }}
      onMouseDown={e => e.currentTarget.style.transform = "scale(0.92)"}
      onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
      onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
    >
      {isDark ? "☀️" : "🌙"}
    </button>
  );
}
