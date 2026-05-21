import React, { useEffect, useState } from "react";
import { Movie, Series, LiveTV } from "@/types";
import { getAllMovies } from "@/services/movieService";
import { getAllSeries } from "@/services/seriesService";
import { getAllLiveTVChannels } from "@/services/liveTvService";
import MovieCard from "@/components/MovieCard";
import SeriesCard from "@/components/SeriesCard";
import LiveTVCard from "@/components/LiveTVCard";
import { useNavigate } from "react-router-dom";

interface SuggestionsProps {
  type: "movie" | "series" | "livetv";
  currentId: string;
  genre?: string;
  reason?: string;
}

const Suggestions: React.FC<SuggestionsProps> = ({ type, currentId, genre, reason }) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        let data: any[] = [];
        if (type === "movie") data = await getAllMovies();
        else if (type === "series") data = await getAllSeries();
        else data = await getAllLiveTVChannels();

        let filtered = data.filter((d) => d.id !== currentId);
        if (genre && type !== "livetv") {
          const sameGenre = filtered.filter((d) => d.genre && d.genre === genre);
          const others = filtered.filter((d) => !d.genre || d.genre !== genre);
          filtered = [...sameGenre, ...others];
        }
        // Shuffle the "others" lightly to vary suggestions
        setItems(filtered.slice(0, 12));
      } catch (e) {
        console.error("Erro ao carregar sugestões", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [type, currentId, genre]);

  if (loading) {
    return <div className="text-netflix-gray text-sm">Carregando sugestões...</div>;
  }

  if (items.length === 0) return null;

  const defaultReason = genre
    ? `Baseado no seu interesse em ${genre}`
    : "Semelhante ao que você está assistindo";
  const displayReason = reason || defaultReason;

  return (
    <div>
      <h2 className="text-lg sm:text-xl font-semibold text-foreground">
        Sugestões para você
      </h2>
      <p className="text-xs sm:text-sm text-muted-foreground mb-3">{displayReason}</p>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-2 sm:gap-3">
        {items.map((item) => {
          if (type === "movie") return <MovieCard key={item.id} movie={item as Movie} />;
          if (type === "series") return <SeriesCard key={item.id} series={item as Series} />;
          return (
            <LiveTVCard
              key={item.id}
              channel={item as LiveTV}
              onClick={() => navigate(`/livetv/player/${item.id}`)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Suggestions;
