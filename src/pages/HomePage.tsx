import React, { useEffect, useState } from "react";
import { Movie } from "@/types";
import { getAllMovies } from "@/services/movieService";
import MovieCard from "@/components/MovieCard";
import EmailAuthForm from "@/components/EmailAuthForm";
import { useAuth } from "@/contexts/AuthContext";
import GenreFilter from "@/components/GenreFilter";
import { useSearch } from "@/contexts/SearchContext";
import { getUniqueGenres, matchesGenre } from "@/lib/genre";
import ContinueWatchingRow from "@/components/ContinueWatchingRow";

import EditorsCollectionsSection from "@/components/EditorsCollectionsSection";
import RequestContentDialog from "@/components/RequestContentDialog";
import { getAllSeries } from "@/services/seriesService";
import { Series } from "@/types";
import MoodFilter from "@/components/MoodFilter";
import { MoodKey, matchesMood } from "@/lib/mood";
import { retry } from "@/lib/retry";
import CardGridSkeleton from "@/components/CardGridSkeleton";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

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
  

  const genres = getUniqueGenres(movies.map(m => m.genre));

  const fetchMovies = React.useCallback(async () => {
    try {
      setError("");
      setLoading(true);
      const [data, seriesData] = await Promise.all([
        retry(() => getAllMovies()),
        retry(() => getAllSeries()).catch(() => []),
      ]);
      setSeriesList(seriesData);
      const sortedMovies = data.sort((a, b) => {
        const yearA = a.year ? parseInt(a.year) : 0;
        const yearB = b.year ? parseInt(b.year) : 0;
        return yearB - yearA;
      });
      setMovies(sortedMovies);
      setFilteredMovies(sortedMovies);
    } catch (error) {
      console.error("Erro ao buscar filmes:", error);
      setError("Não foi possível carregar os filmes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) fetchMovies();
    else if (!authLoading) setLoading(false);
  }, [isLoggedIn, authLoading, fetchMovies]);

  useEffect(() => {
    let result = movies;
    if (searchQuery) result = result.filter((m) => m.title.toLowerCase().includes(searchQuery.toLowerCase()));
    if (selectedGenre !== "all") result = result.filter((m) => matchesGenre(m.genre, selectedGenre));
    if (selectedMood) result = result.filter((m) => matchesMood(m, selectedMood));
    result = result.sort((a, b) => (parseInt(b.year || "0") - parseInt(a.year || "0")));
    setFilteredMovies(result);
  }, [searchQuery, selectedGenre, selectedMood, movies]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-netflix-red">Carregando...</div>
      </div>
    );
  }

  if (!isLoggedIn) return <EmailAuthForm />;

  if (loading) {
    return (
      <div className="container mx-auto py-4 px-3 sm:px-4">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4">Filmes</h1>
        <CardGridSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={fetchMovies} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" /> Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 px-3 sm:px-4">
      <ContinueWatchingRow />
      <EditorsCollectionsSection movies={movies} series={seriesList} />
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold">Filmes</h1>
        <RequestContentDialog />
      </div>
      <MoodFilter selected={selectedMood} onSelect={setSelectedMood} />
      <GenreFilter genres={genres} selectedGenre={selectedGenre} onGenreSelect={setSelectedGenre} />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 mt-4">
        {filteredMovies.map((movie) => <MovieCard key={movie.id} movie={movie} />)}
      </div>
    </div>
  );
};

export default HomePage;
