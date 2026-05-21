import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { AgeRating } from "@/lib/ageRating";

export type PlaybackSpeed = 1 | 1.25 | 1.5 | 1.75 | 2;
export const PLAYBACK_SPEEDS: PlaybackSpeed[] = [1, 1.25, 1.5, 1.75, 2];

interface PreferencesContextType {
  playbackSpeed: PlaybackSpeed;
  setPlaybackSpeed: (s: PlaybackSpeed) => void;
  maxAgeRating: AgeRating;
  setMaxAgeRating: (r: AgeRating) => void;
}

const STORAGE_SPEED = "cineflex:playbackSpeed";
const STORAGE_RATING = "cineflex:maxAgeRating";

const PreferencesContext = createContext<PreferencesContextType>({
  playbackSpeed: 1,
  setPlaybackSpeed: () => {},
  maxAgeRating: "18",
  setMaxAgeRating: () => {},
});

export const usePreferences = () => useContext(PreferencesContext);

const readLS = (k: string) => {
  try { return localStorage.getItem(k); } catch { return null; }
};
const writeLS = (k: string, v: string) => {
  try { localStorage.setItem(k, v); } catch { /* ignore */ }
};

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [playbackSpeed, setPlaybackSpeedState] = useState<PlaybackSpeed>(() => {
    const v = parseFloat(readLS(STORAGE_SPEED) || "1");
    return (PLAYBACK_SPEEDS.includes(v as PlaybackSpeed) ? v : 1) as PlaybackSpeed;
  });
  const [maxAgeRating, setMaxAgeRatingState] = useState<AgeRating>(
    () => (readLS(STORAGE_RATING) as AgeRating) || "18"
  );

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_SPEED && e.newValue) {
        const v = parseFloat(e.newValue);
        if (PLAYBACK_SPEEDS.includes(v as PlaybackSpeed)) setPlaybackSpeedState(v as PlaybackSpeed);
      }
      if (e.key === STORAGE_RATING && e.newValue) {
        setMaxAgeRatingState(e.newValue as AgeRating);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setPlaybackSpeed = useCallback((s: PlaybackSpeed) => {
    writeLS(STORAGE_SPEED, String(s));
    setPlaybackSpeedState(s);
  }, []);

  const setMaxAgeRating = useCallback((r: AgeRating) => {
    writeLS(STORAGE_RATING, r);
    setMaxAgeRatingState(r);
  }, []);

  return (
    <PreferencesContext.Provider value={{ playbackSpeed, setPlaybackSpeed, maxAgeRating, setMaxAgeRating }}>
      {children}
    </PreferencesContext.Provider>
  );
};
