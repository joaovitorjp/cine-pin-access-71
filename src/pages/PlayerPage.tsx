
import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Movie } from "@/types";
import { getMovieById } from "@/services/movieService";
import VideoPlayer from "@/components/VideoPlayer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useHistory } from "@/contexts/HistoryContext";
import { convertVideoLink } from "@/lib/utils";
import PlayerActions from "@/components/PlayerActions";
import Suggestions from "@/components/Suggestions";
import { useTrackWatchProgress } from "@/hooks/useTrackWatchProgress";
import { makeMovieProgressId } from "@/contexts/WatchProgressContext";


const PlayerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = React.useState<Movie | null>(null);
  const [videoUrl, setVideoUrl] = React.useState<string>("");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const { addToHistory } = useHistory();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/");
      return;
    }

    const fetchMovie = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const data = await getMovieById(id);
        
        if (data) {
          setMovie(data);
          const processedUrl = convertVideoLink(data.videoUrl);
          setVideoUrl(processedUrl);
          // Add to history when movie starts playing
          addToHistory(data, 'movie');
        } else {
          setError("Filme não encontrado");
        }
      } catch (error) {
        console.error("Erro ao buscar detalhes do filme:", error);
        setError("Não foi possível carregar o filme. Tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [id, navigate, isLoggedIn]);

  const handleGoBack = () => {
    navigate(`/movie/${id}`);
  };

  // Track watch progress (estimated, since iframe playback is opaque)
  useTrackWatchProgress({
    enabled: !!movie,
    item: movie
      ? {
          id: makeMovieProgressId(movie.id),
          type: "movie",
          title: movie.title,
          imageUrl: movie.imageUrl,
          totalSeconds: 90 * 60, // estimated movie length
          watchedSeconds: 0,
          updatedAt: new Date().toISOString(),
          movieId: movie.id,
        }
      : null,
  });

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
    <div className="bg-black min-h-screen pb-24">
      {movie && (
        <div className="relative w-full">
          <VideoPlayer videoUrl={videoUrl} posterUrl={movie.imageUrl} />
        </div>
      )}
      {movie && (
        <div className="container mx-auto px-4 py-6 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <Button variant="ghost" onClick={handleGoBack} className="mb-2 text-white -ml-3">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <h1 className="text-xl sm:text-2xl font-bold text-white">{movie.title}</h1>
            </div>
            <PlayerActions item={movie} type="movie" shareTitle={movie.title} />
          </div>
          <Suggestions type="movie" currentId={movie.id} genre={movie.genre} reason={`Porque você assistiu "${movie.title}"`} />
        </div>
      )}
    </div>
  );
};


export default PlayerPage;
