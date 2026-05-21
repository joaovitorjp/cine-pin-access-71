import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

const applySavedThemeBeforeRender = () => {
  const keys = ["cineflex:theme", "theme:user", "theme:admin", "theme", "vite-ui-theme", "ui-theme"];
  const read = (storage: Storage, key: string) => {
    try {
      const value = storage.getItem(key);
      return value === "light" || value === "dark" ? value : null;
    } catch {
      return null;
    }
  };

  const stored = keys.reduce<string | null>((theme, key) => {
    if (theme) return theme;
    return read(localStorage, key) || read(sessionStorage, key);
  }, null);
  const system = window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  const theme = stored || system;

  document.documentElement.classList.remove("dark", "light");
  document.documentElement.classList.add(theme);
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.style.colorScheme = theme;
};

applySavedThemeBeforeRender();

createRoot(document.getElementById("root")!).render(<App />);
