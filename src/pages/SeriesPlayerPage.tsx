
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Series, Episode } from "@/types";
import { getSeriesById } from "@/services/seriesService";
import VideoPlayer from "@/components/VideoPlayer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useHistory } from "@/contexts/HistoryContext";
import { convertVideoLink } from "@/lib/utils";

const SeriesPlayerPage: React.FC = () => {
  const { seriesId, seasonNumber, episodeNumber } = useParams<{
    seriesId: string;
    seasonNumber: string;
    episodeNumber: string;
  }>();
  
  const [series, setSeries] = useState<Series | null>(null);
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const { addToHistory } = useHistory();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/");
      return;
    }

    const fetchEpisode = async () => {
      if (!seriesId || !seasonNumber || !episodeNumber) return;

      try {
        setLoading(true);
        const seriesData = await getSeriesById(seriesId);
        
        if (seriesData) {
          setSeries(seriesData);
          
          const season = seriesData.seasons.find(
            s => s.number === parseInt(seasonNumber)
          );
          
          if (season) {
            const ep = season.episodes.find(
              e => e.number === parseInt(episodeNumber)
            );
            
            if (ep) {
              setEpisode(ep);
              const processedUrl = convertVideoLink(ep.videoUrl);
              setVideoUrl(processedUrl);
              // Add to history when episode starts playing
              addToHistory(seriesData, 'series', ep, parseInt(seasonNumber));
            } else {
              setError("Episódio não encontrado");
            }
          } else {
            setError("Temporada não encontrada");
          }
        } else {
          setError("Série não encontrada");
        }
      } catch (error) {
        console.error("Erro ao buscar detalhes do episódio:", error);
        setError("Não foi possível carregar o episódio. Tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchEpisode();
  }, [seriesId, seasonNumber, episodeNumber, navigate, isLoggedIn]);

  const handleGoBack = () => {
    navigate(`/series/${seriesId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-pulse text-netflix-red text-xl">
          Carregando...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black">
        <div className="container mx-auto py-8 px-4">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div className="text-red-500 text-center text-xl">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen">
      {series && episode && (
        <VideoPlayer 
          videoUrl={videoUrl} 
          posterUrl={episode.thumbnail || series.imageUrl} 
        />
      )}
    </div>
  );
};

export default SeriesPlayerPage;
