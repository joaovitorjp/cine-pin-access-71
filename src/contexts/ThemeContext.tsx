import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

// Escopo: admin e usuário usam chaves de localStorage separadas
// para que a troca de tema em um painel não afete o outro.
const getStorageKey = (isAdmin: boolean) => (isAdmin ? "theme:admin" : "theme:user");

const readTheme = (isAdmin: boolean): Theme => {
  const stored = localStorage.getItem(getStorageKey(isAdmin)) as Theme | null;
  return stored === "light" || stored === "dark" ? stored : "dark";
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdmin } = useAuth();
  const [theme, setTheme] = useState<Theme>(() => readTheme(isAdmin));

  // Quando o escopo muda (login/logout admin), recarrega o tema do escopo correto
  useEffect(() => {
    setTheme(readTheme(isAdmin));
  }, [isAdmin]);

  // Aplica e persiste o tema no escopo atual
  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem(getStorageKey(isAdmin), theme);
  }, [theme, isAdmin]);

  const toggleTheme = () => {
    setTheme(prev => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
