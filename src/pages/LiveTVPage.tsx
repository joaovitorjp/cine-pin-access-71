import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LiveTV } from "@/types";
import { getAllLiveTVChannels } from "@/services/liveTvService";
import LiveTVCard from "@/components/LiveTVCard";
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

  const fetchChannels = useCallback(async () => {
    try {
      setError("");
      setLoading(true);
      const data = await retry(() => getAllLiveTVChannels());
      setChannels(data);
      setFilteredChannels(data);
    } catch (error) {
      console.error("Erro ao buscar canais:", error);
      setError("Não foi possível carregar os canais. Verifique sua conexão e tente novamente.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchChannels();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [isLoggedIn, authLoading, fetchChannels]);

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
        <EmailAuthForm />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto py-4 px-3 sm:px-4">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4">TV Ao Vivo</h1>
        <CardGridSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 text-center space-y-4">
        <h1 className="text-2xl sm:text-3xl font-bold">TV Ao Vivo</h1>
        <p className="text-destructive">{error}</p>
        <Button onClick={fetchChannels} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" /> Tentar novamente
        </Button>
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