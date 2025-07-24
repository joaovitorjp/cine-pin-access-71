import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { LiveTV } from "@/types";
import { getLiveTVChannelById } from "@/services/liveTvService";
import VideoPlayer from "@/components/VideoPlayer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useHistory } from "@/contexts/HistoryContext";
import { convertVideoLink } from "@/lib/utils";

const LiveTVPlayerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [channel, setChannel] = React.useState<LiveTV | null>(null);
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

    const fetchChannel = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const data = await getLiveTVChannelById(id);
        
        if (data) {
          setChannel(data);
          const processedUrl = convertVideoLink(data.playerUrl);
          setVideoUrl(processedUrl);
          // Add to history when channel starts playing
          addToHistory(data, 'livetv');
        } else {
          setError("Canal não encontrado");
        }
      } catch (error) {
        console.error("Erro ao buscar detalhes do canal:", error);
        setError("Não foi possível carregar o canal. Tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchChannel();
  }, [id, navigate, isLoggedIn]);

  const handleGoBack = () => {
    navigate("/livetv");
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
          <Button variant="ghost" onClick={handleGoBack} className="mb-4 text-white">
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
      <div className="absolute top-4 left-4 z-50">
        <Button variant="ghost" onClick={handleGoBack} className="text-white hover:bg-white/20">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
      </div>
      {channel && <VideoPlayer videoUrl={videoUrl} posterUrl={channel.imageUrl} />}
    </div>
  );
};

export default LiveTVPlayerPage;