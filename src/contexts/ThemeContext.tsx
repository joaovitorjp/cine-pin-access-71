import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

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

const THEME_STORAGE_KEY = "cineflex:theme";
const LEGACY_THEME_KEYS = ["theme:user", "theme:admin", "theme", "vite-ui-theme", "ui-theme"];
const THEME_EVENT = "cineflex-theme-change";

const isTheme = (value: unknown): value is Theme => value === "light" || value === "dark";

const safeStorageGet = (storage: Storage | undefined, key: string) => {
  try {
    return storage?.getItem(key) ?? null;
  } catch {
    return null;
  }
};

const safeStorageSet = (storage: Storage | undefined, key: string, value: string) => {
  try {
    storage?.setItem(key, value);
  } catch {
    // Storage pode falhar no modo privado do iOS.
  }
};

const safeStorageRemove = (storage: Storage | undefined, key: string) => {
  try {
    storage?.removeItem(key);
  } catch {
    // Ignorar falhas de storage.
  }
};

const getSystemTheme = (): Theme => {
  if (typeof window === "undefined" || !window.matchMedia) return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const readStoredTheme = (): Theme | null => {
  if (typeof window === "undefined") return null;

  const current = safeStorageGet(window.localStorage, THEME_STORAGE_KEY);
  if (isTheme(current)) return current;

  for (const key of LEGACY_THEME_KEYS) {
    const legacy = safeStorageGet(window.localStorage, key) || safeStorageGet(window.sessionStorage, key);
    if (isTheme(legacy)) return legacy;
  }

  return null;
};

const getInitialTheme = (): Theme => readStoredTheme() ?? getSystemTheme();

const applyTheme = (theme: Theme) => {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  root.classList.remove("dark", "light");
  root.classList.add(theme);
  root.setAttribute("data-theme", theme);
  root.style.colorScheme = theme;

  if (document.body) {
    document.body.setAttribute("data-theme", theme);
  }

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

const persistTheme = (theme: Theme) => {
  if (typeof window === "undefined") return;

  safeStorageSet(window.localStorage, THEME_STORAGE_KEY, theme);
  LEGACY_THEME_KEYS.forEach((key) => {
    safeStorageRemove(window.localStorage, key);
    safeStorageRemove(window.sessionStorage, key);
  });

  window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: { theme } }));
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);
  const themeRef = useRef<Theme>(theme);

  const commitTheme = useCallback((nextTheme: Theme | ((current: Theme) => Theme)) => {
    const resolved = typeof nextTheme === "function" ? nextTheme(themeRef.current) : nextTheme;
    themeRef.current = resolved;
    applyTheme(resolved);
    persistTheme(resolved);
    setThemeState(resolved);
  }, []);

  useLayoutEffect(() => {
    themeRef.current = theme;
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    const syncTheme = (next: Theme) => {
      themeRef.current = next;
      applyTheme(next);
      setThemeState(next);
    };

    const onStorage = (e: StorageEvent) => {
      if (e.key === THEME_STORAGE_KEY && isTheme(e.newValue)) {
        syncTheme(e.newValue);
        return;
      }

      if (e.key === null || (e.key && LEGACY_THEME_KEYS.includes(e.key))) {
        syncTheme(readStoredTheme() ?? getSystemTheme());
      }
    };

    const onThemeEvent = (e: Event) => {
      const next = (e as CustomEvent<{ theme?: Theme }>).detail?.theme;
      if (isTheme(next)) syncTheme(next);
    };

    const reapplyCurrentTheme = () => {
      syncTheme(readStoredTheme() ?? themeRef.current);
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener(THEME_EVENT, onThemeEvent);
    window.addEventListener("pageshow", reapplyCurrentTheme);
    window.addEventListener("focus", reapplyCurrentTheme);
    document.addEventListener("visibilitychange", reapplyCurrentTheme);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(THEME_EVENT, onThemeEvent);
      window.removeEventListener("pageshow", reapplyCurrentTheme);
      window.removeEventListener("focus", reapplyCurrentTheme);
      document.removeEventListener("visibilitychange", reapplyCurrentTheme);
    };
  }, []);

  useEffect(() => {
    const media = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!media) return;

    const onSystemThemeChange = (e: MediaQueryListEvent) => {
      if (!readStoredTheme()) {
        const next = e.matches ? "dark" : "light";
        themeRef.current = next;
        applyTheme(next);
        setThemeState(next);
      }
    };

    media.addEventListener?.("change", onSystemThemeChange);
    return () => media.removeEventListener?.("change", onSystemThemeChange);
  }, []);

  const setTheme = useCallback((t: Theme) => commitTheme(t), [commitTheme]);
  const toggleTheme = useCallback(() => {
    commitTheme((current) => (current === "dark" ? "light" : "dark"));
  }, [commitTheme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};