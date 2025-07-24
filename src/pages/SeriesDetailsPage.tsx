
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Series, Episode } from "@/types";
import { getSeriesById } from "@/services/seriesService";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SeriesDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [series, setSeries] = useState<Series | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/");
      return;
    }

    const fetchSeries = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const data = await getSeriesById(id);
        if (data) {
          setSeries(data);
        } else {
          setError("Série não encontrada");
        }
      } catch (error) {
        console.error("Erro ao buscar detalhes da série:", error);
        setError("Não foi possível carregar a série. Tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchSeries();
  }, [id, navigate, isLoggedIn]);

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="animate-pulse text-netflix-red">Carregando...</div>
      </div>
    );
  }

  if (error || !series) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <img
            src={series.imageUrl}
            alt={series.title}
            className="w-full rounded-md object-cover aspect-[2/3]"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b";
            }}
          />
        </div>

        <div className="md:col-span-2">
          <h1 className="text-3xl font-bold mb-2">{series.title}</h1>
          
          <div className="flex flex-wrap gap-4 mb-4">
            {series.year && (
              <span className="text-netflix-gray">{series.year}</span>
            )}
            {series.rating && (
              <span className="text-netflix-gray">{series.rating}</span>
            )}
            {series.genre && (
              <span className="bg-netflix-dark px-2 py-1 rounded text-sm">
                {series.genre}
              </span>
            )}
          </div>
          
          <p className="text-netflix-gray mb-8">{series.description}</p>

          <Tabs defaultValue={`season-1`} className="w-full">
            <TabsList className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 mb-4">
              {series.seasons.map((season) => (
                <TabsTrigger key={season.id} value={`season-${season.number}`}>
                  Temporada {season.number}
                </TabsTrigger>
              ))}
            </TabsList>

            {series.seasons.map((season) => (
              <TabsContent key={season.id} value={`season-${season.number}`}>
                <div className="space-y-4">
                  <h3 className="text-xl font-bold mb-4">
                    Temporada {season.number}
                  </h3>
                  
                  {season.episodes.map((episode) => (
                    <div
                      key={episode.id}
                      className="bg-netflix-dark p-4 rounded-md flex justify-between items-center"
                    >
                      <div>
                        <h4 className="font-semibold">
                          {episode.number}. {episode.title}
                        </h4>
                        {episode.description && (
                          <p className="text-sm text-netflix-gray mt-1">
                            {episode.description}
                          </p>
                        )}
                      </div>
                      <Link to={`/player/series/${series.id}/${season.number}/${episode.number}`}>
                        <Button size="sm" className="bg-netflix-red hover:bg-red-700">
                          <Play className="w-4 h-4 mr-2" />
                          Assistir
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default SeriesDetailsPage;
