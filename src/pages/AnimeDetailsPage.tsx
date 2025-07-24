
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Anime } from "@/types";
import { getAnimeById } from "@/services/animeService";
import { Play, Star, Calendar, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const AnimeDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [anime, setAnime] = useState<Anime | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState(1);

  useEffect(() => {
    const fetchAnime = async () => {
      if (!id) return;
      
      try {
        const animeData = await getAnimeById(id);
        setAnime(animeData);
      } catch (error) {
        console.error("Erro ao buscar anime:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnime();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-netflix-red">Carregando...</div>
      </div>
    );
  }

  if (!anime) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Anime não encontrado</h2>
          <Link to="/anime" className="text-netflix-red hover:underline">
            Voltar para animes
          </Link>
        </div>
      </div>
    );
  }

  const currentSeason = anime.seasons.find(s => s.number === selectedSeason);

  return (
    <div className="min-h-screen bg-netflix-black text-white">
      {/* Back button */}
      <div className="container mx-auto px-4 py-4">
        <Link to="/anime">
          <Button variant="ghost" className="text-netflix-gray hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </Link>
      </div>

      {/* Hero section */}
      <div className="relative h-[60vh] overflow-hidden">
        <img
          src={anime.imageUrl}
          alt={anime.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-netflix-black via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="container mx-auto">
            <h1 className="text-5xl font-bold mb-4">{anime.title}</h1>
            <div className="flex items-center gap-6 mb-6">
              {anime.year && (
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  <span>{anime.year}</span>
                </div>
              )}
              {anime.rating && (
                <div className="flex items-center">
                  <Star className="w-5 h-5 mr-2 text-yellow-400" />
                  <span>{anime.rating}</span>
                </div>
              )}
              {anime.genre && (
                <span className="px-3 py-1 bg-netflix-red rounded-full text-sm">
                  {anime.genre}
                </span>
              )}
            </div>
            <p className="text-lg text-netflix-gray max-w-3xl">{anime.description}</p>
          </div>
        </div>
      </div>

      {/* Episodes section */}
      <div className="container mx-auto px-4 py-8">
        {/* Season selector */}
        {anime.seasons.length > 1 && (
          <div className="mb-6">
            <div className="flex gap-2 flex-wrap">
              {anime.seasons.map((season) => (
                <Button
                  key={season.id}
                  variant={selectedSeason === season.number ? "default" : "outline"}
                  onClick={() => setSelectedSeason(season.number)}
                  className={selectedSeason === season.number ? "bg-netflix-red hover:bg-red-700" : ""}
                >
                  Temporada {season.number}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Episodes list */}
        {currentSeason && (
          <div>
            <h2 className="text-2xl font-bold mb-6">
              Temporada {currentSeason.number} - Episódios
            </h2>
            <div className="grid gap-4">
              {currentSeason.episodes.map((episode) => (
                <Link
                  key={episode.id}
                  to={`/player/anime/${anime.id}/${currentSeason.number}/${episode.number}`}
                  className="group"
                >
                  <div className="flex items-center gap-4 p-4 bg-netflix-dark rounded-lg hover:bg-gray-700 transition-colors">
                    <div className="relative">
                      <img
                        src={episode.thumbnail || anime.imageUrl}
                        alt={episode.title}
                        className="w-32 h-18 object-cover rounded"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = anime.imageUrl;
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded">
                        <Play className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg font-semibold">{episode.number}.</span>
                        <h3 className="text-lg font-semibold">{episode.title}</h3>
                      </div>
                      {episode.description && (
                        <p className="text-netflix-gray text-sm line-clamp-2">
                          {episode.description}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnimeDetailsPage;
