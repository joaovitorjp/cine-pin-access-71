import React, { useEffect, useState } from "react";
import { LiveTV } from "@/types";
import { getAllLiveTVChannels } from "@/services/liveTvService";
import LiveTVCard from "@/components/LiveTVCard";
import PinLoginForm from "@/components/PinLoginForm";
import { useAuth } from "@/contexts/AuthContext";
import SearchBar from "@/components/SearchBar";
import GenreFilter from "@/components/GenreFilter";
import { convertVideoLink } from "@/lib/utils";

const LiveTVPage: React.FC = () => {
  const [channels, setChannels] = useState<LiveTV[]>([]);
  const [filteredChannels, setFilteredChannels] = useState<LiveTV[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { isLoggedIn, loading: authLoading } = useAuth();

  // Extract unique categories from channels
  const categories = [...new Set(channels.flatMap(c => c.category ? [c.category] : []))];

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
      result = result.filter(c => c.category === selectedCategory);
    }
    
    setFilteredChannels(result);
  }, [searchQuery, selectedCategory, channels]);

  const handleChannelClick = (channel: LiveTV) => {
    const convertedUrl = convertVideoLink(channel.playerUrl);
    window.open(convertedUrl, '_blank', 'noopener,noreferrer');
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
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold">TV Ao Vivo</h1>
        
        <div className="flex flex-col gap-4">
          <SearchBar onSearch={setSearchQuery} />
          <GenreFilter
            genres={categories}
            selectedGenre={selectedCategory}
            onGenreSelect={setSelectedCategory}
          />
        </div>

        {filteredChannels.length === 0 ? (
          <div className="text-netflix-gray text-center py-8">
            Nenhum canal encontrado.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
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