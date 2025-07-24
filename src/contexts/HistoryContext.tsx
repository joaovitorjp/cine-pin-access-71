import React, { createContext, useContext, useState, useEffect } from "react";
import { Movie, Series, LiveTV, Episode } from "@/types";

interface HistoryItem {
  id: string;
  title: string;
  imageUrl: string;
  type: 'movie' | 'series' | 'livetv';
  watchedAt: string;
  url?: string;
  // Para séries
  seriesId?: string;
  seasonNumber?: number;
  episodeNumber?: number;
  episodeTitle?: string;
}

interface HistoryContextType {
  history: HistoryItem[];
  addToHistory: (item: Movie | Series | LiveTV, type: 'movie' | 'series' | 'livetv', episode?: Episode, seasonNumber?: number) => void;
  clearHistory: () => void;
  removeFromHistory: (id: string) => void;
}

const HistoryContext = createContext<HistoryContextType>({
  history: [],
  addToHistory: () => {},
  clearHistory: () => {},
  removeFromHistory: () => {},
});

export const useHistory = () => useContext(HistoryContext);

export const HistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const storedHistory = localStorage.getItem("watchHistory");
    if (storedHistory) {
      setHistory(JSON.parse(storedHistory));
    }
  }, []);

  const saveHistory = (newHistory: HistoryItem[]) => {
    localStorage.setItem("watchHistory", JSON.stringify(newHistory));
    setHistory(newHistory);
  };

  const addToHistory = (
    item: Movie | Series | LiveTV, 
    type: 'movie' | 'series' | 'livetv',
    episode?: Episode,
    seasonNumber?: number
  ) => {
    const itemTitle = 'title' in item ? item.title : item.name;
    const historyItem: HistoryItem = {
      id: type === 'series' && episode ? `${item.id}-s${seasonNumber}-e${episode.number}` : item.id,
      title: type === 'series' && episode ? `${itemTitle} - T${seasonNumber}E${episode.number}: ${episode.title}` : itemTitle,
      imageUrl: type === 'series' && episode?.thumbnail ? episode.thumbnail : item.imageUrl,
      type,
      watchedAt: new Date().toISOString(),
      ...(type === 'movie' && { url: (item as Movie).videoUrl }),
      ...(type === 'livetv' && { url: (item as LiveTV).playerUrl }),
      ...(type === 'series' && episode && {
        seriesId: item.id,
        seasonNumber,
        episodeNumber: episode.number,
        episodeTitle: episode.title,
      }),
    };

    // Remove if already exists and add to beginning
    const filteredHistory = history.filter(h => h.id !== historyItem.id);
    const newHistory = [historyItem, ...filteredHistory].slice(0, 50); // Keep only last 50 items
    
    saveHistory(newHistory);
  };

  const clearHistory = () => {
    localStorage.removeItem("watchHistory");
    setHistory([]);
  };

  const removeFromHistory = (id: string) => {
    const newHistory = history.filter(item => item.id !== id);
    saveHistory(newHistory);
  };

  return (
    <HistoryContext.Provider
      value={{
        history,
        addToHistory,
        clearHistory,
        removeFromHistory,
      }}
    >
      {children}
    </HistoryContext.Provider>
  );
};