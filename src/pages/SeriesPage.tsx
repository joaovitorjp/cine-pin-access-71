import React, { useEffect, useState } from "react";
import { Series } from "@/types";
import { getAllSeries } from "@/services/seriesService";
import SeriesCard from "@/components/SeriesCard";
import PinLoginForm from "@/components/PinLoginForm";
import { useAuth } from "@/contexts/AuthContext";
import SearchBar from "@/components/SearchBar";
import GenreFilter from "@/components/GenreFilter";

const SeriesPage: React.FC = () => {
  const [series, setSeries] = useState<Series[]>([]);
  const [filteredSeries, setFilteredSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const { isLoggedIn, loading: authLoading } = useAuth();

  // Extract unique genres from series
  const genres = [...new Set(series.flatMap(s => s.genre ? [s.genre] : []))];

  useEffect(() => {
    const fetchSeries = async () => {
      try {
        const data = await getAllSeries();
        // Sort series by year (most recent first)
        const sortedSeries = data.sort((a, b) => {
          const yearA = a.year ? parseInt(a.year) : 0;
          const yearB = b.year ? parseInt(b.year) : 0;
          return yearB - yearA;
        });
        setSeries(sortedSeries);
        setFilteredSeries(sortedSeries);
      } catch (error) {
        console.error("Erro ao buscar séries:", error);
        setError("Não foi possível carregar as séries. Tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    };

    if (isLoggedIn) {
      fetchSeries();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [isLoggedIn, authLoading]);

  // Filter series based on search query and selected genre
  useEffect(() => {
    let result = series;
    
    if (searchQuery) {
      result = result.filter(s =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (selectedGenre !== "all") {
      result = result.filter(s => s.genre === selectedGenre);
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
        <PinLoginForm />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Séries</h1>
        <div className="animate-pulse text-netflix-gray">Carregando séries...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Séries</h1>
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold">Séries</h1>
        
        <div className="flex flex-col gap-4">
          <SearchBar onSearch={setSearchQuery} />
          <GenreFilter
            genres={genres}
            selectedGenre={selectedGenre}
            onGenreSelect={setSelectedGenre}
          />
        </div>

        {filteredSeries.length === 0 ? (
          <div className="text-netflix-gray text-center py-8">
            Nenhuma série encontrada.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
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
