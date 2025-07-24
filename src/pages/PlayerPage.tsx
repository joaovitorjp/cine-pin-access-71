
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
      {movie && <VideoPlayer videoUrl={videoUrl} posterUrl={movie.imageUrl} />}
    </div>
  );
};

export default PlayerPage;
