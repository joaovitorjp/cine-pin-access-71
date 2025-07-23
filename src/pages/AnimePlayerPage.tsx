
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Anime, Episode } from "@/types";
import { getAnimeById } from "@/services/animeService";
import VideoPlayer from "@/components/VideoPlayer";
import { ArrowLeft, SkipBack, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";

const AnimePlayerPage: React.FC = () => {
  const { animeId, seasonNumber, episodeNumber } = useParams<{
    animeId: string;
    seasonNumber: string;
    episodeNumber: string;
  }>();
  const navigate = useNavigate();
  const [anime, setAnime] = useState<Anime | null>(null);
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnimeAndEpisode = async () => {
      if (!animeId || !seasonNumber || !episodeNumber) return;

      try {
        const animeData = await getAnimeById(animeId);
        if (animeData) {
          setAnime(animeData);
          const season = animeData.seasons.find(s => s.number === parseInt(seasonNumber));
          if (season) {
            const ep = season.episodes.find(e => e.number === parseInt(episodeNumber));
            setEpisode(ep || null);
          }
        }
      } catch (error) {
        console.error("Erro ao buscar anime e episódio:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnimeAndEpisode();
  }, [animeId, seasonNumber, episodeNumber]);

  const handleGoBack = () => {
    navigate(`/anime/${animeId}`);
  };

  const getAdjacentEpisode = (direction: 'next' | 'prev') => {
    if (!anime || !episode) return null;

    const currentSeason = anime.seasons.find(s => s.number === parseInt(seasonNumber!));
    if (!currentSeason) return null;

    const currentEpisodeIndex = currentSeason.episodes.findIndex(e => e.number === episode.number);
    
    if (direction === 'next') {
      // Try next episode in current season
      if (currentEpisodeIndex < currentSeason.episodes.length - 1) {
        return {
          episode: currentSeason.episodes[currentEpisodeIndex + 1],
          season: currentSeason.number
        };
      }
      // Try first episode of next season
      const nextSeason = anime.seasons.find(s => s.number === currentSeason.number + 1);
      if (nextSeason && nextSeason.episodes.length > 0) {
        return {
          episode: nextSeason.episodes[0],
          season: nextSeason.number
        };
      }
    } else {
      // Try previous episode in current season
      if (currentEpisodeIndex > 0) {
        return {
          episode: currentSeason.episodes[currentEpisodeIndex - 1],
          season: currentSeason.number
        };
      }
      // Try last episode of previous season
      const prevSeason = anime.seasons.find(s => s.number === currentSeason.number - 1);
      if (prevSeason && prevSeason.episodes.length > 0) {
        return {
          episode: prevSeason.episodes[prevSeason.episodes.length - 1],
          season: prevSeason.number
        };
      }
    }
    
    return null;
  };

  const navigateToEpisode = (direction: 'next' | 'prev') => {
    const adjacentEpisode = getAdjacentEpisode(direction);
    if (adjacentEpisode) {
      navigate(`/player/anime/${animeId}/${adjacentEpisode.season}/${adjacentEpisode.episode.number}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-pulse text-netflix-red">Carregando...</div>
      </div>
    );
  }

  if (!anime || !episode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Episódio não encontrado</h2>
          <Button onClick={handleGoBack} variant="outline">
            Voltar para o anime
          </Button>
        </div>
      </div>
    );
  }

  const nextEpisode = getAdjacentEpisode('next');
  const prevEpisode = getAdjacentEpisode('prev');

  return (
    <div className="min-h-screen bg-black">
      {/* Controls header */}
      <div className="relative z-50 bg-black/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              onClick={handleGoBack}
              variant="ghost"
              className="text-white hover:text-netflix-red"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Voltar
            </Button>
            
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigateToEpisode('prev')}
                disabled={!prevEpisode}
                variant="ghost"
                className="text-white hover:text-netflix-red disabled:opacity-50"
              >
                <SkipBack className="w-5 h-5 mr-2" />
                Anterior
              </Button>
              
              <Button
                onClick={() => navigateToEpisode('next')}
                disabled={!nextEpisode}
                variant="ghost"
                className="text-white hover:text-netflix-red disabled:opacity-50"
              >
                Próximo
                <SkipForward className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
          
          <div className="mt-2">
            <h1 className="text-xl font-bold text-white">
              {anime.title} - T{seasonNumber}E{episodeNumber}: {episode.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Video player */}
      <div className="relative">
        <VideoPlayer videoUrl={episode.videoUrl} />
      </div>

      {/* Episode info */}
      <div className="container mx-auto px-4 py-6">
        <div className="bg-netflix-dark rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            Episódio {episode.number}: {episode.title}
          </h2>
          {episode.description && (
            <p className="text-netflix-gray">{episode.description}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnimePlayerPage;
