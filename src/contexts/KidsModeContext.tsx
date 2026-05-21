import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

const STORAGE_ACTIVE = "cineflex:kidsMode:active";
const STORAGE_PIN = "cineflex:kidsMode:pin";
const DEFAULT_PIN = "1234";

interface KidsModeContextType {
  isKidsMode: boolean;
  parentalPin: string;
  enableKidsMode: () => void;
  disableKidsMode: (pin: string) => boolean;
  setParentalPin: (currentPin: string, newPin: string) => boolean;
}

const KidsModeContext = createContext<KidsModeContextType>({
  isKidsMode: false,
  parentalPin: DEFAULT_PIN,
  enableKidsMode: () => {},
  disableKidsMode: () => false,
  setParentalPin: () => false,
});

export const useKidsMode = () => useContext(KidsModeContext);

const readLS = (k: string): string | null => {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
};
const writeLS = (k: string, v: string) => {
  try {
    localStorage.setItem(k, v);
  } catch {
    /* ignore */
  }
};

export const KidsModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isKidsMode, setIsKidsMode] = useState<boolean>(() => readLS(STORAGE_ACTIVE) === "1");
  const [parentalPin, setParentalPinState] = useState<string>(
    () => readLS(STORAGE_PIN) || DEFAULT_PIN
  );

  // sync across tabs
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_ACTIVE) setIsKidsMode(e.newValue === "1");
      if (e.key === STORAGE_PIN && e.newValue) setParentalPinState(e.newValue);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const enableKidsMode = useCallback(() => {
    writeLS(STORAGE_ACTIVE, "1");
    setIsKidsMode(true);
  }, []);

  const disableKidsMode = useCallback(
    (pin: string) => {
      if (pin !== parentalPin) return false;
      writeLS(STORAGE_ACTIVE, "0");
      setIsKidsMode(false);
      return true;
    },
    [parentalPin]
  );

  const setParentalPin = useCallback(
    (currentPin: string, newPin: string) => {
      if (currentPin !== parentalPin) return false;
      if (!/^\d{4,6}$/.test(newPin)) return false;
      writeLS(STORAGE_PIN, newPin);
      setParentalPinState(newPin);
      return true;
    },
    [parentalPin]
  );

  return (
    <KidsModeContext.Provider
      value={{ isKidsMode, parentalPin, enableKidsMode, disableKidsMode, setParentalPin }}
    >
      {children}
    </KidsModeContext.Provider>
  );
};
