import React, { createContext, useContext, useState, useEffect } from "react";
import { Movie, Series, LiveTV } from "@/types";

interface FavoritesContextType {
  favoriteMovies: Movie[];
  favoriteSeries: Series[];
  favoriteLiveTV: LiveTV[];
  addToFavorites: (item: Movie | Series | LiveTV, type: 'movie' | 'series' | 'livetv') => void;
  removeFromFavorites: (id: string, type: 'movie' | 'series' | 'livetv') => void;
  isFavorite: (id: string, type: 'movie' | 'series' | 'livetv') => boolean;
}

const FavoritesContext = createContext<FavoritesContextType>({
  favoriteMovies: [],
  favoriteSeries: [],
  favoriteLiveTV: [],
  addToFavorites: () => {},
  removeFromFavorites: () => {},
  isFavorite: () => false,
});

export const useFavorites = () => useContext(FavoritesContext);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favoriteMovies, setFavoriteMovies] = useState<Movie[]>([]);
  const [favoriteSeries, setFavoriteSeries] = useState<Series[]>([]);
  const [favoriteLiveTV, setFavoriteLiveTV] = useState<LiveTV[]>([]);

  useEffect(() => {
    const storedFavorites = localStorage.getItem("favorites");
    if (storedFavorites) {
      const favorites = JSON.parse(storedFavorites);
      setFavoriteMovies(favorites.movies || []);
      setFavoriteSeries(favorites.series || []);
      setFavoriteLiveTV(favorites.livetv || []);
    }
  }, []);

  const saveFavorites = (movies: Movie[], series: Series[], livetv: LiveTV[]) => {
    localStorage.setItem("favorites", JSON.stringify({
      movies,
      series,
      livetv
    }));
  };

  const addToFavorites = (item: Movie | Series | LiveTV, type: 'movie' | 'series' | 'livetv') => {
    switch (type) {
      case 'movie':
        const newMovies = [...favoriteMovies, item as Movie];
        setFavoriteMovies(newMovies);
        saveFavorites(newMovies, favoriteSeries, favoriteLiveTV);
        break;
      case 'series':
        const newSeries = [...favoriteSeries, item as Series];
        setFavoriteSeries(newSeries);
        saveFavorites(favoriteMovies, newSeries, favoriteLiveTV);
        break;
      case 'livetv':
        const newLiveTV = [...favoriteLiveTV, item as LiveTV];
        setFavoriteLiveTV(newLiveTV);
        saveFavorites(favoriteMovies, favoriteSeries, newLiveTV);
        break;
    }
  };

  const removeFromFavorites = (id: string, type: 'movie' | 'series' | 'livetv') => {
    switch (type) {
      case 'movie':
        const filteredMovies = favoriteMovies.filter(movie => movie.id !== id);
        setFavoriteMovies(filteredMovies);
        saveFavorites(filteredMovies, favoriteSeries, favoriteLiveTV);
        break;
      case 'series':
        const filteredSeries = favoriteSeries.filter(series => series.id !== id);
        setFavoriteSeries(filteredSeries);
        saveFavorites(favoriteMovies, filteredSeries, favoriteLiveTV);
        break;
      case 'livetv':
        const filteredLiveTV = favoriteLiveTV.filter(livetv => livetv.id !== id);
        setFavoriteLiveTV(filteredLiveTV);
        saveFavorites(favoriteMovies, favoriteSeries, filteredLiveTV);
        break;
    }
  };

  const isFavorite = (id: string, type: 'movie' | 'series' | 'livetv') => {
    switch (type) {
      case 'movie':
        return favoriteMovies.some(movie => movie.id === id);
      case 'series':
        return favoriteSeries.some(series => series.id === id);
      case 'livetv':
        return favoriteLiveTV.some(livetv => livetv.id === id);
      default:
        return false;
    }
  };

  return (
    <FavoritesContext.Provider
      value={{
        favoriteMovies,
        favoriteSeries,
        favoriteLiveTV,
        addToFavorites,
        removeFromFavorites,
        isFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};