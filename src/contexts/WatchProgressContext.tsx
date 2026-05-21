import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

export interface WatchProgressItem {
  id: string; // unique key (movie: movie-<id>, series: series-<id>-s<season>-e<episode>)
  type: "movie" | "series";
  title: string;
  imageUrl: string;
  totalSeconds: number;
  watchedSeconds: number;
  updatedAt: string;
  removed?: boolean;
  // movie
  movieId?: string;
  // series
  seriesId?: string;
  seriesTitle?: string;
  seasonNumber?: number;
  episodeNumber?: number;
  episodeTitle?: string;
}

const STORAGE_KEY = "cineflex:watchProgress:v1";
const COMPLETE_RATIO = 0.95;

const safeRead = (): Record<string, WatchProgressItem> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

const safeWrite = (data: Record<string, WatchProgressItem>) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
};

interface WatchProgressContextType {
  items: WatchProgressItem[]; // active (not removed, not completed)
  allItems: Record<string, WatchProgressItem>;
  upsertProgress: (item: WatchProgressItem) => void;
  addWatchedSeconds: (id: string, seconds: number) => void;
  removeProgress: (id: string) => void;
  markCompleted: (id: string) => void;
  getProgress: (id: string) => WatchProgressItem | undefined;
}

const WatchProgressContext = createContext<WatchProgressContextType>({
  items: [],
  allItems: {},
  upsertProgress: () => {},
  addWatchedSeconds: () => {},
  removeProgress: () => {},
  markCompleted: () => {},
  getProgress: () => undefined,
});

export const useWatchProgress = () => useContext(WatchProgressContext);

export const WatchProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<Record<string, WatchProgressItem>>(() => safeRead());

  // Cross-tab sync
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setData(safeRead());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const persist = useCallback((next: Record<string, WatchProgressItem>) => {
    safeWrite(next);
    setData(next);
  }, []);

  const upsertProgress = useCallback((item: WatchProgressItem) => {
    setData(prev => {
      const existing = prev[item.id];
      const merged: WatchProgressItem = {
        ...existing,
        ...item,
        watchedSeconds: Math.max(existing?.watchedSeconds ?? 0, item.watchedSeconds ?? 0),
        removed: false,
        updatedAt: new Date().toISOString(),
      };
      const next = { ...prev, [item.id]: merged };
      safeWrite(next);
      return next;
    });
  }, []);

  const addWatchedSeconds = useCallback((id: string, seconds: number) => {
    setData(prev => {
      const cur = prev[id];
      if (!cur) return prev;
      const watchedSeconds = Math.min(cur.totalSeconds, cur.watchedSeconds + seconds);
      const completed = watchedSeconds / cur.totalSeconds >= COMPLETE_RATIO;
      const next: Record<string, WatchProgressItem> = {
        ...prev,
        [id]: {
          ...cur,
          watchedSeconds,
          updatedAt: new Date().toISOString(),
          removed: completed ? true : cur.removed,
        },
      };
      safeWrite(next);
      return next;
    });
  }, []);

  const removeProgress = useCallback((id: string) => {
    setData(prev => {
      if (!prev[id]) return prev;
      const next = { ...prev, [id]: { ...prev[id], removed: true, updatedAt: new Date().toISOString() } };
      safeWrite(next);
      return next;
    });
  }, []);

  const markCompleted = useCallback((id: string) => {
    setData(prev => {
      if (!prev[id]) return prev;
      const next = {
        ...prev,
        [id]: { ...prev[id], watchedSeconds: prev[id].totalSeconds, removed: true, updatedAt: new Date().toISOString() },
      };
      safeWrite(next);
      return next;
    });
  }, []);

  const getProgress = useCallback((id: string) => data[id], [data]);

  const items = Object.values(data)
    .filter(it => !it.removed && it.watchedSeconds / it.totalSeconds < COMPLETE_RATIO && it.watchedSeconds > 5)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  return (
    <WatchProgressContext.Provider
      value={{ items, allItems: data, upsertProgress, addWatchedSeconds, removeProgress, markCompleted, getProgress }}
    >
      {children}
    </WatchProgressContext.Provider>
  );
};

export const makeMovieProgressId = (movieId: string) => `movie-${movieId}`;
export const makeEpisodeProgressId = (seriesId: string, season: number, episode: number) =>
  `series-${seriesId}-s${season}-e${episode}`;
