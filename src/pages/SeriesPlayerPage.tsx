
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Series, Episode } from "@/types";
import { getSeriesById } from "@/services/seriesService";
import VideoPlayer from "@/components/VideoPlayer";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, SkipForward } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useHistory } from "@/contexts/HistoryContext";
import { convertVideoLink } from "@/lib/utils";
import PlayerActions from "@/components/PlayerActions";
import Suggestions from "@/components/Suggestions";
import { useTrackWatchProgress } from "@/hooks/useTrackWatchProgress";
import { makeEpisodeProgressId, useWatchProgress } from "@/contexts/WatchProgressContext";

const AUTO_NEXT_KEY = "cineflex:autoNextEpisode";


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
  const { getProgress } = useWatchProgress();

  const [autoNext, setAutoNext] = useState<boolean>(() => {
    try {
      return localStorage.getItem(AUTO_NEXT_KEY) !== "false";
    } catch {
      return true;
    }
  });
  useEffect(() => {
    try { localStorage.setItem(AUTO_NEXT_KEY, String(autoNext)); } catch {}
  }, [autoNext]);

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

  // Determine next episode (same season → next, or next season ep1)
  const nextEpisode = useMemo(() => {
    if (!series || !episode || !seasonNumber) return null;
    const seasonNum = parseInt(seasonNumber);
    const season = series.seasons.find(s => s.number === seasonNum);
    if (!season) return null;
    const sortedEps = [...season.episodes].sort((a, b) => a.number - b.number);
    const idx = sortedEps.findIndex(e => e.number === episode.number);
    if (idx >= 0 && idx < sortedEps.length - 1) {
      return { seasonNumber: seasonNum, episodeNumber: sortedEps[idx + 1].number, title: sortedEps[idx + 1].title };
    }
    // try next season
    const nextSeason = series.seasons
      .filter(s => s.number > seasonNum)
      .sort((a, b) => a.number - b.number)[0];
    if (nextSeason && nextSeason.episodes.length > 0) {
      const firstEp = [...nextSeason.episodes].sort((a, b) => a.number - b.number)[0];
      return { seasonNumber: nextSeason.number, episodeNumber: firstEp.number, title: firstEp.title };
    }
    return null;
  }, [series, episode, seasonNumber]);

  const goToNextEpisode = () => {
    if (!nextEpisode || !seriesId) return;
    navigate(`/player/series/${seriesId}/${nextEpisode.seasonNumber}/${nextEpisode.episodeNumber}`);
  };

  // Track watch progress for the current episode
  const progressItem = series && episode && seasonNumber
    ? {
        id: makeEpisodeProgressId(series.id, parseInt(seasonNumber), episode.number),
        type: "series" as const,
        title: `${series.title} - T${seasonNumber}E${episode.number}: ${episode.title}`,
        imageUrl: episode.thumbnail || series.imageUrl,
        totalSeconds: 45 * 60,
        watchedSeconds: 0,
        updatedAt: new Date().toISOString(),
        seriesId: series.id,
        seriesTitle: series.title,
        seasonNumber: parseInt(seasonNumber),
        episodeNumber: episode.number,
        episodeTitle: episode.title,
      }
    : null;

  useTrackWatchProgress({ enabled: !!progressItem, item: progressItem });

  // Auto-advance: when current episode reaches ~end and toggle is on
  useEffect(() => {
    if (!autoNext || !progressItem || !nextEpisode) return;
    const interval = window.setInterval(() => {
      const p = getProgress(progressItem.id);
      if (p && p.watchedSeconds / p.totalSeconds >= 0.97) {
        window.clearInterval(interval);
        goToNextEpisode();
      }
    }, 5000);
    return () => window.clearInterval(interval);
  }, [autoNext, progressItem?.id, nextEpisode?.episodeNumber, getProgress]);

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
    <div className="bg-black min-h-screen pb-12">
      {series && episode && (
        <>
          <VideoPlayer
            videoUrl={videoUrl}
            posterUrl={episode.thumbnail || series.imageUrl}
          />
          <div className="container mx-auto px-4 py-6 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <Button variant="ghost" onClick={handleGoBack} className="mb-2 text-white -ml-3">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                <h1 className="text-xl sm:text-2xl font-bold text-white">{series.title}</h1>
                <p className="text-sm text-netflix-gray">
                  T{seasonNumber} • E{episodeNumber} — {episode.title}
                </p>
              </div>
              <div className="flex flex-col sm:items-end gap-3">
                <PlayerActions
                  item={series}
                  type="series"
                  shareTitle={`${series.title} - ${episode.title}`}
                />
                <div className="flex items-center gap-2">
                  <Switch
                    id="auto-next"
                    checked={autoNext}
                    onCheckedChange={setAutoNext}
                  />
                  <Label htmlFor="auto-next" className="text-xs text-white">
                    Próximo episódio automático
                  </Label>
                </div>
                {nextEpisode && (
                  <Button
                    onClick={goToNextEpisode}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    size="sm"
                  >
                    <SkipForward className="w-4 h-4 mr-2" />
                    Próximo: T{nextEpisode.seasonNumber}E{nextEpisode.episodeNumber}
                  </Button>
                )}
              </div>
            </div>
            <Suggestions
              type="series"
              currentId={series.id}
              genre={series.genre}
              reason={`Porque você está assistindo "${series.title}"`}
            />
          </div>
        </>
      )}
    </div>
  );
};


export default SeriesPlayerPage;
