import React, { useEffect, useState } from "react";
import { Movie } from "@/types";
import { getAllMovies } from "@/services/movieService";
import MovieCard from "@/components/MovieCard";
import PinLoginForm from "@/components/PinLoginForm";
import { useAuth } from "@/contexts/AuthContext";
import SearchBar from "@/components/SearchBar";
import GenreFilter from "@/components/GenreFilter";
import { useSearch } from "@/contexts/SearchContext";
import { getUniqueGenres, matchesGenre, normalizeGenreKey, formatGenreLabel } from "@/lib/genre";
import ContinueWatchingRow from "@/components/ContinueWatchingRow";
import { useWatchProgress } from "@/contexts/WatchProgressContext";
import EditorsCollectionsSection from "@/components/EditorsCollectionsSection";
import RequestContentDialog from "@/components/RequestContentDialog";
import { getAllSeries } from "@/services/seriesService";
import { Series } from "@/types";
import MoodFilter from "@/components/MoodFilter";
import { MoodKey, matchesMood } from "@/lib/mood";
import { isAllowedByRating } from "@/lib/ageRating";
import { usePreferences } from "@/contexts/PreferencesContext";

const HomePage: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { query: searchQuery } = useSearch();
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [selectedMood, setSelectedMood] = useState<MoodKey | null>(null);
  const { isLoggedIn, loading: authLoading } = useAuth();
  const { maxAgeRating } = usePreferences();

  // Extract unique, normalized genres from movies
  const genres = getUniqueGenres(movies.map(m => m.genre));

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const [data, seriesData] = await Promise.all([getAllMovies(), getAllSeries().catch(() => [])]);
        setSeriesList(seriesData);
        // Sort movies by year (most recent first)
        const sortedMovies = data.sort((a, b) => {
          const yearA = a.year ? parseInt(a.year) : 0;
          const yearB = b.year ? parseInt(b.year) : 0;
          return yearB - yearA;
        });
        setMovies(sortedMovies);
        setFilteredMovies(sortedMovies);
      } catch (error) {
        console.error("Erro ao buscar filmes:", error);
        setError("Não foi possível carregar os filmes. Tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    };

    if (isLoggedIn) {
      fetchMovies();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [isLoggedIn, authLoading]);

  // Filter movies based on search query, genre, mood, age rating
  useEffect(() => {
    let result = movies;

    // Age rating filter (always applied)
    result = result.filter((m) => isAllowedByRating(m.rating, maxAgeRating));

    if (searchQuery) {
      result = result.filter((movie) =>
        movie.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedGenre !== "all") {
      result = result.filter((movie) => matchesGenre(movie.genre, selectedGenre));
    }

    if (selectedMood) {
      result = result.filter((movie) => matchesMood(movie, selectedMood));
    }

    result = result.sort((a, b) => {
      const yearA = a.year ? parseInt(a.year) : 0;
      const yearB = b.year ? parseInt(b.year) : 0;
      return yearB - yearA;
    });

    setFilteredMovies(result);
  }, [searchQuery, selectedGenre, selectedMood, maxAgeRating, movies]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-netflix-red">Carregando...</div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <PinLoginForm />;
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Filmes</h1>
        <div className="animate-pulse text-netflix-gray">Carregando filmes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Filmes</h1>
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  // Recommendation reason based on watch progress history
  const { allItems } = useWatchProgress();
  const recentWatched = Object.values(allItems)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];

  let recommended: Movie[] = [];
  let recommendationReason = "";
  if (recentWatched && movies.length) {
    const refTitle = recentWatched.type === "series" ? recentWatched.seriesTitle : recentWatched.title;
    // Try to find original movie by movieId to grab its genre as anchor
    const anchor = movies.find(m => m.id === recentWatched.movieId);
    const anchorGenreKey = anchor?.genre ? normalizeGenreKey(anchor.genre) : "";
    if (anchorGenreKey) {
      recommended = movies
        .filter(m => m.id !== anchor?.id && normalizeGenreKey(m.genre) === anchorGenreKey)
        .slice(0, 12);
      recommendationReason = `Porque você assistiu "${refTitle}"`;
    } else if (refTitle) {
      recommended = movies.slice(0, 12);
      recommendationReason = `Porque você assistiu "${refTitle}"`;
    }
  }

  return (
    <div className="container mx-auto py-4 px-3 sm:px-4">
      <div className="flex flex-col gap-6">
        <ContinueWatchingRow />

        {recommended.length > 0 && (
          <section className="space-y-2 animate-fade-in">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">Recomendado para você</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">{recommendationReason}</p>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-2 sm:gap-3">
              {recommended.map(movie => (
                <MovieCard key={`rec-${movie.id}`} movie={movie} />
              ))}
            </div>
          </section>
        )}

        <EditorsCollectionsSection movies={movies} series={seriesList} />

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h1 className="text-2xl sm:text-3xl font-bold">Filmes</h1>
          <RequestContentDialog />
        </div>

        <GenreFilter
          genres={genres}
          selectedGenre={selectedGenre}
          onGenreSelect={setSelectedGenre}
        />

        {filteredMovies.length === 0 ? (
          <div className="text-netflix-gray text-center py-8">
            Nenhum filme encontrado.
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-2 sm:gap-3">
            {filteredMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
