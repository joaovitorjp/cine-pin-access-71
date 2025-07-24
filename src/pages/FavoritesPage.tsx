import React, { useState } from "react";
import { useFavorites } from "@/contexts/FavoritesContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MovieCard from "@/components/MovieCard";
import SeriesCard from "@/components/SeriesCard";
import LiveTVCard from "@/components/LiveTVCard";
import { Heart, Film, Tv, Radio } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FavoritesPage: React.FC = () => {
  const { favoriteMovies, favoriteSeries, favoriteLiveTV } = useFavorites();
  const [activeTab, setActiveTab] = useState("movies");
  const navigate = useNavigate();

  const totalFavorites = favoriteMovies.length + favoriteSeries.length + favoriteLiveTV.length;

  return (
    <div className="min-h-screen bg-background text-foreground p-4 pb-20">
      <div className="container mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Heart className="w-8 h-8 text-red-500" />
          <h1 className="text-3xl font-bold">Favoritos</h1>
          <span className="text-muted-foreground">({totalFavorites})</span>
        </div>

        {totalFavorites === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Nenhum favorito ainda</h2>
            <p className="text-muted-foreground">
              Adicione filmes, séries ou canais aos favoritos para vê-los aqui
            </p>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-6">
              <TabsTrigger value="movies" className="flex items-center gap-2">
                <Film className="w-4 h-4" />
                Filmes ({favoriteMovies.length})
              </TabsTrigger>
              <TabsTrigger value="series" className="flex items-center gap-2">
                <Tv className="w-4 h-4" />
                Séries ({favoriteSeries.length})
              </TabsTrigger>
              <TabsTrigger value="livetv" className="flex items-center gap-2">
                <Radio className="w-4 h-4" />
                TV ({favoriteLiveTV.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="movies" className="space-y-4">
              {favoriteMovies.length === 0 ? (
                <div className="text-center py-8">
                  <Film className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Nenhum filme favoritado</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {favoriteMovies.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="series" className="space-y-4">
              {favoriteSeries.length === 0 ? (
                <div className="text-center py-8">
                  <Tv className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Nenhuma série favoritada</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {favoriteSeries.map((series) => (
                    <SeriesCard key={series.id} series={series} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="livetv" className="space-y-4">
              {favoriteLiveTV.length === 0 ? (
                <div className="text-center py-8">
                  <Radio className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Nenhum canal favoritado</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {favoriteLiveTV.map((channel) => (
                    <LiveTVCard 
                      key={channel.id} 
                      channel={channel} 
                      onClick={() => navigate(`/livetv/player/${channel.id}`)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;