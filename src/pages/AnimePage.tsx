import React, { useEffect, useState } from "react";
import { Anime } from "@/types";
import { getAllAnimes } from "@/services/animeService";
import AnimeCard from "@/components/AnimeCard";
import PinLoginForm from "@/components/PinLoginForm";
import { useAuth } from "@/contexts/AuthContext";
import SearchBar from "@/components/SearchBar";
import GenreFilter from "@/components/GenreFilter";

const AnimePage: React.FC = () => {
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [filteredAnimes, setFilteredAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const { isLoggedIn, loading: authLoading } = useAuth();

  // Extract unique genres from animes
  const genres = [...new Set(animes.flatMap(a => a.genre ? [a.genre] : []))];

  useEffect(() => {
    const fetchAnimes = async () => {
      try {
        const data = await getAllAnimes();
        // Sort animes by year (most recent first)
        const sortedAnimes = data.sort((a, b) => {
          const yearA = a.year ? parseInt(a.year) : 0;
          const yearB = b.year ? parseInt(b.year) : 0;
          return yearB - yearA;
        });
        setAnimes(sortedAnimes);
        setFilteredAnimes(sortedAnimes);
      } catch (error) {
        console.error("Erro ao buscar animes:", error);
        setError("Não foi possível carregar os animes. Tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    };

    if (isLoggedIn) {
      fetchAnimes();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [isLoggedIn, authLoading]);

  // Filter animes based on search query and selected genre
  useEffect(() => {
    let result = animes;
    
    if (searchQuery) {
      result = result.filter(a =>
        a.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (selectedGenre !== "all") {
      result = result.filter(a => a.genre === selectedGenre);
    }
    
    // Keep the year sorting after filtering
    result = result.sort((a, b) => {
      const yearA = a.year ? parseInt(a.year) : 0;
      const yearB = b.year ? parseInt(b.year) : 0;
      return yearB - yearA;
    });
    
    setFilteredAnimes(result);
  }, [searchQuery, selectedGenre, animes]);

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
        <h1 className="text-3xl font-bold mb-8">Animes</h1>
        <div className="animate-pulse text-netflix-gray">Carregando animes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Animes</h1>
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold">Animes</h1>
        
        <div className="flex flex-col gap-4">
          <SearchBar onSearch={setSearchQuery} />
          <GenreFilter
            genres={genres}
            selectedGenre={selectedGenre}
            onGenreSelect={setSelectedGenre}
          />
        </div>

        {filteredAnimes.length === 0 ? (
          <div className="text-netflix-gray text-center py-8">
            Nenhum anime encontrado.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredAnimes.map((anime) => (
              <AnimeCard key={anime.id} anime={anime} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnimePage;
