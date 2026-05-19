import React, { useEffect, useState } from "react";
import { Movie } from "@/types";
import { getAllMovies } from "@/services/movieService";
import { getAllSeries } from "@/services/seriesService";
import { getAllLiveTVChannels } from "@/services/liveTvService";
import { getFeaturedLoginItems } from "@/services/featuredLoginService";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Carrossel diagonal de destaques na tela de login.
 * Suporta filmes, séries e canais.
 */
const CACHE_KEY = "featuredLoginCarousel:v1";

const FeaturedLoginCarousel: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>(() => {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) return JSON.parse(cached) as Movie[];
    } catch {}
    return [];
  });
  const [selected, setSelected] = useState<Movie | null>(null);


  useEffect(() => {
    const load = async () => {
      try {
        const [items, allMovies, allSeries, allChannels] = await Promise.all([
          getFeaturedLoginItems(),
          getAllMovies(),
          getAllSeries(),
          getAllLiveTVChannels(),
        ]);
        const movieMap = new Map(allMovies.map(m => [m.id, m]));
        const seriesMap = new Map(allSeries.map(s => [s.id, s]));
        const channelMap = new Map(allChannels.map(c => [c.id, c]));

        let list: Movie[] = [];
        if (items.length > 0) {
          list = items
            .map(it => {
              if (it.type === "movie") return movieMap.get(it.id);
              if (it.type === "series") {
                const s = seriesMap.get(it.id);
                if (!s) return undefined;
                return {
                  id: `series-${s.id}`,
                  title: s.title,
                  imageUrl: s.imageUrl,
                  videoUrl: "",
                  description: s.description,
                  year: s.year,
                  rating: s.rating,
                  genre: s.genre,
                } as Movie;
              }
              if (it.type === "channel") {
                const c = channelMap.get(it.id);
                if (!c) return undefined;
                return {
                  id: `channel-${c.id}`,
                  title: c.name,
                  imageUrl: c.imageUrl,
                  videoUrl: "",
                  description: c.description || "",
                  genre: c.category,
                } as Movie;
              }
              return undefined;
            })
            .filter((m): m is Movie => !!m);
        }
        // fallback: mostra os primeiros filmes se nada estiver configurado
        if (list.length === 0) list = allMovies.slice(0, 12);
        setMovies(list);
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify(list));
        } catch {}
      } catch (e) {
        console.error("Erro ao carregar destaques:", e);
      }
    };
    load();
  }, []);

  if (movies.length === 0) return null;


  // Garante filmes únicos antes de distribuir (evita repetição na mesma linha)
  const uniqueMovies = Array.from(new Map(movies.map(m => [m.id, m])).values());

  // Distribui filmes em linhas suficientes para cobrir qualquer viewport.
  const ROW_COUNT = 14;
  const MIN_ITEMS_PER_HALF_ROW = 48;
  const rows = Array.from({ length: ROW_COUNT }, (_, rowIdx) => {
    const offset = Math.floor((uniqueMovies.length / ROW_COUNT) * rowIdx);
    const rotated = [...uniqueMovies.slice(offset), ...uniqueMovies.slice(0, offset)];
    const halfRow = Array.from(
      { length: Math.max(MIN_ITEMS_PER_HALF_ROW, rotated.length) },
      (_, index) => rotated[index % rotated.length]
    );
    // duplicamos a metade final (2x) para loop seamless com translateX(-50%).
    return [...halfRow, ...halfRow];
  });

  return (
    <>
      <div
        className="fixed inset-0 h-screen w-screen overflow-hidden"
        style={{
          position: "fixed",
          inset: 0,
          width: "100vw",
          height: "100dvh",
          minHeight: "100vh",
          zIndex: 0,
        }}
        aria-hidden="false"
      >
        <div
          className="absolute left-1/2 top-1/2 flex flex-col justify-center gap-[5px]"
          style={{
            width: "200vmax",
            minHeight: "200vmax",
            transform: "translate(-50%, -50%) rotate(-6deg)",
            transformOrigin: "center",
          }}
        >
          {rows.map((rowMovies, rowIdx) => (
            <div
              key={rowIdx}
              className={`flex gap-2 ${rowIdx % 2 === 0 ? "animate-marquee-x" : "animate-marquee-x-reverse"}`}
              style={{
                width: "max-content",
              }}

            >
              {rowMovies.map((m, i) => (
                <button
                  key={`${rowIdx}-${m.id}-${i}`}
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    setSelected(m);
                  }}
                  className="group relative flex-shrink-0 aspect-[2/3] rounded-md overflow-hidden shadow-2xl ring-1 ring-white/10 bg-netflix-dark md:hover:ring-netflix-red md:transition-all md:duration-300 md:hover:scale-105 focus:outline-none focus:ring-2 focus:ring-netflix-red touch-manipulation select-none"
                  style={{ width: "clamp(76px, 8vmax, 190px)", WebkitTapHighlightColor: "transparent" }}
                  aria-label={`Ver detalhes de ${m.title}`}
                >
                  <img
                    src={m.imageUrl}
                    alt={m.title}
                    className="w-full h-full object-cover"
                    loading="eager"
                    decoding="async"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b";
                    }}
                  />
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Overlay para legibilidade do formulário */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80 pointer-events-none" />
      </div>




      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="bg-netflix-dark text-white border-gray-700 max-w-md p-0 overflow-hidden">
          {selected && (
            <div>
              <div className="relative aspect-[16/9] bg-black">
                <img
                  src={selected.imageUrl}
                  alt={selected.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-netflix-dark via-transparent to-transparent" />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelected(null)}
                  className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white"
                  aria-label="Fechar"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="text-lg font-bold">{selected.title}</h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-netflix-gray">
                    {selected.year && <span>{selected.year}</span>}
                    {selected.genre && <span>{selected.genre}</span>}
                    {selected.rating && (
                      <span className="flex items-center gap-1 text-yellow-400">
                        <Star className="w-3 h-3 fill-yellow-400" />
                        {selected.rating}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-netflix-gray leading-relaxed max-h-40 overflow-y-auto">
                  {selected.description || "Sem sinopse disponível."}
                </p>
                <p className="text-xs text-netflix-gray italic pt-2 border-t border-gray-700">
                  Faça login com seu PIN para assistir.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FeaturedLoginCarousel;
