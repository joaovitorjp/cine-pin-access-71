import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  toggleTheme: () => {},
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

// Escopo: admin e usuário usam chaves separadas
const getStorageKey = (isAdmin: boolean) => (isAdmin ? "theme:admin" : "theme:user");

const readTheme = (isAdmin: boolean): Theme => {
  try {
    const stored = localStorage.getItem(getStorageKey(isAdmin)) as Theme | null;
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // localStorage indisponível (modo privado iOS, etc.)
  }
  return "dark";
};

// Aplica o tema preservando outras classes no <html>
const applyTheme = (theme: Theme) => {
  const root = document.documentElement;
  root.classList.remove("dark", "light");
  root.classList.add(theme);
  root.style.colorScheme = theme;
  // Atualiza meta theme-color para a barra de status mobile
  const meta = document.querySelector('meta[name="theme-color"]');
  const color = theme === "dark" ? "#141414" : "#ffffff";
  if (meta) {
    meta.setAttribute("content", color);
  } else {
    const m = document.createElement("meta");
    m.name = "theme-color";
    m.content = color;
    document.head.appendChild(m);
  }
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdmin } = useAuth();
  const [theme, setThemeState] = useState<Theme>(() => {
    const t = readTheme(isAdmin);
    if (typeof document !== "undefined") applyTheme(t);
    return t;
  });

  // Recarrega ao trocar de escopo (login/logout admin)
  useEffect(() => {
    const t = readTheme(isAdmin);
    setThemeState(t);
    applyTheme(t);
  }, [isAdmin]);

  // Aplica e persiste sempre que o tema muda
  useEffect(() => {
    applyTheme(theme);
    try {
      localStorage.setItem(getStorageKey(isAdmin), theme);
    } catch {
      // ignorar falhas de storage
    }
  }, [theme, isAdmin]);

  // Sincroniza entre abas/janelas
  useEffect(() => {
    const key = getStorageKey(isAdmin);
    const onStorage = (e: StorageEvent) => {
      if (e.key === key && (e.newValue === "light" || e.newValue === "dark")) {
        setThemeState(e.newValue);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [isAdmin]);

  const setTheme = useCallback((t: Theme) => setThemeState(t), []);
  const toggleTheme = useCallback(
    () => setThemeState((prev) => (prev === "dark" ? "light" : "dark")),
    []
  );

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
