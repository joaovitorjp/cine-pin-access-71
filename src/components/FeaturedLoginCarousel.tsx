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
const CACHE_KEY = "featuredLoginCarousel:v2";
const LEGACY_CACHE_KEY = "featuredLoginCarousel:v1";

const createPoster = (index: number, title: string) => {
  const palettes = [
    ["141414", "E50914", "7F1D1D"],
    ["0A0A0A", "991B1B", "27272A"],
    ["111827", "B91C1C", "020617"],
    ["18181B", "DC2626", "3F3F46"],
  ];
  const [bg, accent, deep] = palettes[index % palettes.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 360"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#${bg}"/><stop offset="0.52" stop-color="#${deep}"/><stop offset="1" stop-color="#${accent}"/></linearGradient></defs><rect width="240" height="360" rx="12" fill="url(#g)"/><rect x="18" y="22" width="204" height="316" rx="8" fill="none" stroke="#ffffff" stroke-opacity=".12" stroke-width="2"/><circle cx="120" cy="142" r="42" fill="#ffffff" fill-opacity=".08"/><path d="M105 118v48l42-24-42-24Z" fill="#ffffff" fill-opacity=".72"/><text x="120" y="252" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="22" font-weight="700">CINE FLEX</text><text x="120" y="282" text-anchor="middle" fill="#ffffff" fill-opacity=".72" font-family="Arial, sans-serif" font-size="13">${title}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const INSTANT_POSTERS: Movie[] = Array.from({ length: 24 }, (_, index) => ({
  id: `instant-poster-${index}`,
  title: `Destaque ${index + 1}`,
  imageUrl: createPoster(index, `DESTAQUE ${index + 1}`),
  videoUrl: "",
  description: "Carregando destaques...",
}));

const FeaturedLoginCarousel: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>(() => {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY) || localStorage.getItem(LEGACY_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as Movie[];
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INSTANT_POSTERS;
  });
  const [selected, setSelected] = useState<Movie | null>(null);


  useEffect(() => {
    const load = async () => {
      try {
        const [itemsResult, moviesResult, seriesResult, channelsResult] = await Promise.allSettled([
          getFeaturedLoginItems(),
          getAllMovies(),
          getAllSeries(),
          getAllLiveTVChannels(),
        ]);
        const items = itemsResult.status === "fulfilled" ? itemsResult.value : [];
        const allMovies = moviesResult.status === "fulfilled" ? moviesResult.value : [];
        const allSeries = seriesResult.status === "fulfilled" ? seriesResult.value : [];
        const allChannels = channelsResult.status === "fulfilled" ? channelsResult.value : [];
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
        if (list.length > 0) {
          setMovies(list);
          try {
            const serialized = JSON.stringify(list);
            sessionStorage.setItem(CACHE_KEY, serialized);
            localStorage.setItem(LEGACY_CACHE_KEY, serialized);
          } catch {}
        }
      } catch (e) {
        console.error("Erro ao carregar destaques:", e);
      }
    };
    load();
  }, []);

  if (movies.length === 0) return null;


  // Garante uma malha leve e instantânea: poucas capas únicas repetidas cobrem a tela sem travar o primeiro render.
  const uniqueMovies = Array.from(new Map(movies.map(m => [m.id, m])).values()).slice(0, 32);

  // Distribui filmes em linhas suficientes para cobrir qualquer viewport.
  const ROW_COUNT = 10;
  const MIN_ITEMS_PER_HALF_ROW = 32;
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
                    loading={rowIdx < 3 ? "eager" : "lazy"}
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
