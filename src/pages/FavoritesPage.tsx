import React, { useState } from "react";
import { useFavorites } from "@/contexts/FavoritesContext";
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

  const EmptyState = ({ icon: Icon, label }: { icon: typeof Film; label: string }) => (
    <div className="text-center py-16">
      <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-muted/40 flex items-center justify-center">
        <Icon className="w-10 h-10 text-muted-foreground" />
      </div>
      <p className="text-muted-foreground">{label}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <div className="container mx-auto px-4 py-6">
        {/* Hero header */}
        <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-red-500/15 via-card to-card p-6 sm:p-8 mb-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(0_85%_60%/0.2),transparent_60%)] pointer-events-none" />
          <div className="relative flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-red-500/20 flex items-center justify-center shrink-0">
              <Heart className="w-7 h-7 text-red-500 fill-red-500" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Favoritos</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {totalFavorites} {totalFavorites === 1 ? "item salvo" : "itens salvos"}
              </p>
            </div>
          </div>
        </div>

        {totalFavorites === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-muted/40 flex items-center justify-center">
              <Heart className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Nenhum favorito ainda</h2>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Adicione filmes, séries ou canais aos favoritos e eles aparecerão aqui.
            </p>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-6 h-12 rounded-2xl bg-card border border-border p-1">
              <TabsTrigger value="movies" className="rounded-xl gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Film className="w-4 h-4" />
                <span className="hidden sm:inline">Filmes</span>
                <span className="opacity-70">({favoriteMovies.length})</span>
              </TabsTrigger>
              <TabsTrigger value="series" className="rounded-xl gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Tv className="w-4 h-4" />
                <span className="hidden sm:inline">Séries</span>
                <span className="opacity-70">({favoriteSeries.length})</span>
              </TabsTrigger>
              <TabsTrigger value="livetv" className="rounded-xl gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Radio className="w-4 h-4" />
                <span className="hidden sm:inline">TV</span>
                <span className="opacity-70">({favoriteLiveTV.length})</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="movies">
              {favoriteMovies.length === 0 ? (
                <EmptyState icon={Film} label="Nenhum filme favoritado" />
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {favoriteMovies.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="series">
              {favoriteSeries.length === 0 ? (
                <EmptyState icon={Tv} label="Nenhuma série favoritada" />
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {favoriteSeries.map((series) => (
                    <SeriesCard key={series.id} series={series} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="livetv">
              {favoriteLiveTV.length === 0 ? (
                <EmptyState icon={Radio} label="Nenhum canal favoritado" />
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
