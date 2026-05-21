import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LiveTV } from "@/types";
import { getAllLiveTVChannels } from "@/services/liveTvService";
import LiveTVCard from "@/components/LiveTVCard";
import PinLoginForm from "@/components/PinLoginForm";
import { useAuth } from "@/contexts/AuthContext";
import SearchBar from "@/components/SearchBar";
import GenreFilter from "@/components/GenreFilter";
import { useSearch } from "@/contexts/SearchContext";
import { getUniqueGenres, matchesGenre } from "@/lib/genre";

const LiveTVPage: React.FC = () => {
  const [channels, setChannels] = useState<LiveTV[]>([]);
  const [filteredChannels, setFilteredChannels] = useState<LiveTV[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { query: searchQuery } = useSearch();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { isLoggedIn, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Extract unique, normalized categories from channels
  const categories = getUniqueGenres(channels.map(c => c.category));

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const data = await getAllLiveTVChannels();
        setChannels(data);
        setFilteredChannels(data);
      } catch (error) {
        console.error("Erro ao buscar canais:", error);
        setError("Não foi possível carregar os canais. Tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    };

    if (isLoggedIn) {
      fetchChannels();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [isLoggedIn, authLoading]);

  // Filter channels based on search query and selected category
  useEffect(() => {
    let result = channels;
    
    if (searchQuery) {
      result = result.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (selectedCategory !== "all") {
      result = result.filter(c => matchesGenre(c.category, selectedCategory));
    }
    
    setFilteredChannels(result);
  }, [searchQuery, selectedCategory, channels]);

  const handleChannelClick = (channel: LiveTV) => {
    navigate(`/livetv/player/${channel.id}`);
  };

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
        <h1 className="text-3xl font-bold mb-8">TV Ao Vivo</h1>
        <div className="animate-pulse text-netflix-gray">Carregando canais...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">TV Ao Vivo</h1>
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 px-3 sm:px-4">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">TV Ao Vivo</h1>

        <GenreFilter
          genres={categories}
          selectedGenre={selectedCategory}
          onGenreSelect={setSelectedCategory}
        />

        {filteredChannels.length === 0 ? (
          <div className="text-netflix-gray text-center py-8">
            Nenhum canal encontrado.
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-2 sm:gap-3">
            {filteredChannels.map((channel) => (
              <LiveTVCard
                key={channel.id}
                channel={channel}
                onClick={() => handleChannelClick(channel)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveTVPage;