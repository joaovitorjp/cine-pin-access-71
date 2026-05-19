import React, { useEffect, useState } from "react";
import { Movie } from "@/types";
import { getAllMovies } from "@/services/movieService";
import { getFeaturedLoginMovieIds } from "@/services/featuredLoginService";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Carrossel diagonal de filmes em destaque na tela de login.
 * Fica como fundo interativo - clique abre detalhes (capa, sinopse, avaliação).
 */
const FeaturedLoginCarousel: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selected, setSelected] = useState<Movie | null>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [ids, all] = await Promise.all([
          getFeaturedLoginMovieIds(),
          getAllMovies(),
        ]);
        let list: Movie[] = [];
        if (ids.length > 0) {
          const map = new Map(all.map(m => [m.id, m]));
          list = ids.map(id => map.get(id)).filter((m): m is Movie => !!m);
        }
        // fallback: mostra os primeiros filmes se nada estiver configurado
        if (list.length === 0) list = all.slice(0, 12);
        setMovies(list);
      } catch (e) {
        console.error("Erro ao carregar filmes em destaque:", e);
      }
    };
    load();
  }, []);

  if (movies.length === 0) return null;

  // Garante filmes únicos antes de distribuir (evita repetição na mesma linha)
  const uniqueMovies = Array.from(new Map(movies.map(m => [m.id, m])).values());

  // Distribui filmes em 6 linhas
  const ROW_COUNT = 6;
  const rows = Array.from({ length: ROW_COUNT }, (_, rowIdx) => {
    const offset = Math.floor((uniqueMovies.length / ROW_COUNT) * rowIdx);
    const rotated = [...uniqueMovies.slice(offset), ...uniqueMovies.slice(0, offset)];
    // duplicamos a lista (2x) para loop seamless com translateX(-50%).
    // Como cada filme só reaparece após um ciclo completo (~100s),
    // o mesmo filme nunca se repete na mesma linha em menos de 10s.
    return [...rotated, ...rotated];
  });

  return (
    <>
      <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden="false">
        <div
          className="absolute -inset-x-[10%] -inset-y-[5%] flex flex-col gap-[5px]"
          style={{ transform: "rotate(-6deg)", transformOrigin: "center" }}
        >
          {rows.map((rowMovies, rowIdx) => (
            <div
              key={rowIdx}
              className={`flex gap-2 ${rowIdx % 2 === 0 ? "animate-marquee-x" : "animate-marquee-x-reverse"}`}
              style={{
                animationPlayState: paused ? "paused" : "running",
                width: "max-content",
              }}
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
              onTouchStart={() => setPaused(true)}
              onTouchEnd={() => setPaused(false)}
            >
              {rowMovies.map((m, i) => (
                <button
                  key={`${rowIdx}-${m.id}-${i}`}
                  type="button"
                  onClick={() => setSelected(m)}
                  className="group relative flex-shrink-0 w-24 sm:w-28 md:w-32 aspect-[2/3] rounded-md overflow-hidden shadow-2xl ring-1 ring-white/10 hover:ring-netflix-red transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-netflix-red"
                  aria-label={`Ver detalhes de ${m.title}`}
                >
                  <img
                    src={m.imageUrl}
                    alt={m.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
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
