import React, { useCallback, useEffect, useState } from "react";
import { Series } from "@/types";
import { getAllSeries } from "@/services/seriesService";
import SeriesCard from "@/components/SeriesCard";
import EmailAuthForm from "@/components/EmailAuthForm";
import { useAuth } from "@/contexts/AuthContext";
import SearchBar from "@/components/SearchBar";
import GenreFilter from "@/components/GenreFilter";
import { useSearch } from "@/contexts/SearchContext";
import { getUniqueGenres, matchesGenre } from "@/lib/genre";
import { retry } from "@/lib/retry";
import CardGridSkeleton from "@/components/CardGridSkeleton";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

const SeriesPage: React.FC = () => {
  const [series, setSeries] = useState<Series[]>([]);
  const [filteredSeries, setFilteredSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { query: searchQuery } = useSearch();
  const [selectedGenre, setSelectedGenre] = useState("all");
  const { isLoggedIn, loading: authLoading } = useAuth();

  // Extract unique, normalized genres from series
  const genres = getUniqueGenres(series.map(s => s.genre));

  const fetchSeries = useCallback(async () => {
    try {
      setError("");
      setLoading(true);
      const data = await retry(() => getAllSeries());
      const sortedSeries = data.sort((a, b) => {
        const yearA = a.year ? parseInt(a.year) : 0;
        const yearB = b.year ? parseInt(b.year) : 0;
        return yearB - yearA;
      });
      setSeries(sortedSeries);
      setFilteredSeries(sortedSeries);
    } catch (error) {
      console.error("Erro ao buscar séries:", error);
      setError("Não foi possível carregar as séries. Verifique sua conexão e tente novamente.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchSeries();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [isLoggedIn, authLoading, fetchSeries]);

  // Filter series based on search query and selected genre
  useEffect(() => {
    let result = series;
    
    if (searchQuery) {
      result = result.filter(s =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (selectedGenre !== "all") {
      result = result.filter(s => matchesGenre(s.genre, selectedGenre));
    }
    
    // Keep the year sorting after filtering
    result = result.sort((a, b) => {
      const yearA = a.year ? parseInt(a.year) : 0;
      const yearB = b.year ? parseInt(b.year) : 0;
      return yearB - yearA;
    });
    
    setFilteredSeries(result);
  }, [searchQuery, selectedGenre, series]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-netflix-red">Carregando...</div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <EmailAuthForm />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto py-4 px-3 sm:px-4">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4">Séries</h1>
        <CardGridSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 text-center space-y-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Séries</h1>
        <p className="text-destructive">{error}</p>
        <Button onClick={fetchSeries} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" /> Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 px-3 sm:px-4">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Séries</h1>

        <GenreFilter
          genres={genres}
          selectedGenre={selectedGenre}
          onGenreSelect={setSelectedGenre}
        />

        {filteredSeries.length === 0 ? (
          <div className="text-netflix-gray text-center py-8">
            Nenhuma série encontrada.
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-2 sm:gap-3">
            {filteredSeries.map((s) => (
              <SeriesCard key={s.id} series={s} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SeriesPage;
