
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Movie } from "@/types";
import { getMovieById } from "@/services/movieService";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useHistory } from "@/contexts/HistoryContext";
import { convertVideoLink } from "@/lib/utils";
import FavoriteButton from "@/components/FavoriteButton";
import VideoPlayer from "@/components/VideoPlayer";

const MovieDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [showPlayer, setShowPlayer] = useState(false);
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

    const fetchMovie = async () => {
      if (!id) return;

      try {
        const data = await getMovieById(id);
        if (data) {
          console.log('Movie data loaded:', data);
          console.log('Movie videoUrl:', data.videoUrl);
          console.log('Movie playerUrl:', data.playerUrl);
          setMovie(data);
          // Use videoUrl if playerUrl doesn't exist
          const urlToUse = data.playerUrl || data.videoUrl;
          console.log('URL to use:', urlToUse);
          const processedUrl = convertVideoLink(urlToUse);
          console.log('Processed video URL:', processedUrl);
          setVideoUrl(processedUrl);
        } else {
          setError("Filme não encontrado");
        }
      } catch (error) {
        console.error("Erro ao buscar detalhes do filme:", error);
        setError("Não foi possível carregar os detalhes do filme. Tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [id, navigate, isLoggedIn]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handlePlayMovie = () => {
    console.log('handlePlayMovie called');
    console.log('Movie:', movie);
    console.log('Video URL:', videoUrl);
    
    if (movie && videoUrl) {
      addToHistory(movie, 'movie');
      setShowPlayer(true);
    } else {
      console.log('Missing movie or videoUrl');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="animate-pulse text-netflix-gray">Carregando detalhes do filme...</div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Button variant="ghost" onClick={handleGoBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <div className="text-red-500">{error || "Filme não encontrado"}</div>
      </div>
    );
  }

  if (showPlayer && videoUrl) {
    return (
      <div className="bg-black min-h-screen">
        <div className="absolute top-4 left-4 z-50">
          <Button variant="ghost" onClick={() => setShowPlayer(false)} className="text-white hover:bg-white/20">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
        <VideoPlayer videoUrl={videoUrl} posterUrl={movie?.imageUrl} />
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section with Backdrop */}
      <div 
        className="relative h-[60vh] bg-cover bg-center"
        style={{ 
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(20,20,20,1)), url(${movie.imageUrl})` 
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-netflix-black via-transparent to-transparent">
          <div className="container mx-auto h-full flex flex-col justify-end px-4 py-12">
            <Button variant="ghost" onClick={handleGoBack} className="self-start mb-4 text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-4xl font-bold mb-2">{movie.title}</h1>
            
            <div className="flex items-center gap-4 mb-4">
              {movie.year && <span className="text-netflix-gray">{movie.year}</span>}
              {movie.rating && (
                <div className="flex items-center">
                  <span className="text-yellow-400">★</span>
                  <span className="ml-1">{movie.rating}</span>
                </div>
              )}
              {movie.genre && <span className="text-netflix-gray">{movie.genre}</span>}
            </div>
            
            <div className="flex items-center gap-4 mb-4">
              <Button 
                onClick={handlePlayMovie} 
                className="bg-netflix-red hover:bg-red-700"
              >
                <Play className="w-4 h-4 mr-2" />
                Assistir
              </Button>
              <FavoriteButton item={movie} type="movie" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-semibold mb-4">Sinopse</h2>
          <p className="text-netflix-gray text-lg mb-8">{movie.description}</p>
        </div>
      </div>
    </div>
  );
};

export default MovieDetailsPage;
