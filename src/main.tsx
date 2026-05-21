import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

const applySavedThemeBeforeRender = () => {
  const keys = ["cineflex:theme", "theme:user", "theme:admin", "theme", "vite-ui-theme", "ui-theme"];
  const getStorage = (type: "localStorage" | "sessionStorage") => {
    try {
      return window[type];
    } catch {
      return undefined;
    }
  };
  const read = (storage: Storage, key: string) => {
    try {
      const value = storage.getItem(key);
      return value === "light" || value === "dark" ? value : null;
    } catch {
      return null;
    }
  };
  const local = getStorage("localStorage");
  const session = getStorage("sessionStorage");

  const stored = keys.reduce<string | null>((theme, key) => {
    if (theme) return theme;
    return (local ? read(local, key) : null) || (session ? read(session, key) : null);
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
