import React, { useEffect, useState } from "react";
import { Movie } from "@/types";
import { getAllMovies } from "@/services/movieService";
import MovieCard from "@/components/MovieCard";
import PinLoginForm from "@/components/PinLoginForm";
import { useAuth } from "@/contexts/AuthContext";
import SearchBar from "@/components/SearchBar";
import GenreFilter from "@/components/GenreFilter";
import { useSearch } from "@/contexts/SearchContext";
import { getUniqueGenres, matchesGenre, normalizeGenre } from "@/lib/genre";
import ContinueWatchingRow from "@/components/ContinueWatchingRow";
import { useWatchProgress } from "@/contexts/WatchProgressContext";

const HomePage: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { query: searchQuery } = useSearch();
  const [selectedGenre, setSelectedGenre] = useState("all");
  const { isLoggedIn, loading: authLoading } = useAuth();

  // Extract unique, normalized genres from movies
  const genres = getUniqueGenres(movies.map(m => m.genre));

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const data = await getAllMovies();
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

  // Filter movies based on search query and selected genre
  useEffect(() => {
    let result = movies;
    
    if (searchQuery) {
      result = result.filter(movie =>
        movie.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (selectedGenre !== "all") {
      result = result.filter(movie => matchesGenre(movie.genre, selectedGenre));
    }
    
    // Keep the year sorting after filtering
    result = result.sort((a, b) => {
      const yearA = a.year ? parseInt(a.year) : 0;
      const yearB = b.year ? parseInt(b.year) : 0;
      return yearB - yearA;
    });
    
    setFilteredMovies(result);
  }, [searchQuery, selectedGenre, movies]);

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

  return (
    <div className="container mx-auto py-4 px-3 sm:px-4">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold">Filmes</h1>
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
