import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Movie, Series } from "@/types";
import { getAllMovies } from "@/services/movieService";
import { getAllSeries } from "@/services/seriesService";
import { filterKidsContent, isKidSearchSafe } from "@/lib/kidsContent";
import { useKidsMode } from "@/contexts/KidsModeContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Star, Sparkles, Smile, Heart, Rocket, Lock, Search } from "lucide-react";
import KidsPinDialog from "@/components/KidsPinDialog";

const AVATARS = [
  { icon: Smile, color: "bg-yellow-300 text-yellow-900", label: "Sol" },
  { icon: Heart, color: "bg-pink-300 text-pink-900", label: "Coração" },
  { icon: Rocket, color: "bg-sky-300 text-sky-900", label: "Foguete" },
  { icon: Sparkles, color: "bg-violet-300 text-violet-900", label: "Estrela" },
];

const KidsPage: React.FC = () => {
  const { isKidsMode, disableKidsMode } = useKidsMode();
  const navigate = useNavigate();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [avatarIdx, setAvatarIdx] = useState(0);
  const [pinOpen, setPinOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [m, s] = await Promise.all([getAllMovies(), getAllSeries()]);
        // Kids mode forces strictest rating
        const safeMovies = filterKidsContent(m).filter((it) => {
          const r = (it as any).rating?.toString().toLowerCase() || "";
          return !r.includes("16") && !r.includes("18") && !r.includes("14");
        });
        const safeSeries = filterKidsContent(s).filter((it) => {
          const r = (it as any).rating?.toString().toLowerCase() || "";
          return !r.includes("16") && !r.includes("18") && !r.includes("14");
        });
        setMovies(safeMovies);
        setSeries(safeSeries);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const safeQuery = isKidSearchSafe(query) ? query.trim().toLowerCase() : "";

  const filteredMovies = useMemo(
    () =>
      safeQuery
        ? movies.filter((m) => m.title.toLowerCase().includes(safeQuery))
        : movies,
    [movies, safeQuery]
  );
  const filteredSeries = useMemo(
    () =>
      safeQuery
        ? series.filter((s) => s.title.toLowerCase().includes(safeQuery))
        : series,
    [series, safeQuery]
  );

  const Avatar = AVATARS[avatarIdx].icon;

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 via-pink-50 to-yellow-50 dark:from-sky-950/40 dark:via-pink-950/30 dark:to-yellow-950/30">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 rounded-3xl bg-white/70 dark:bg-white/10 backdrop-blur px-4 py-3 shadow-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAvatarIdx((i) => (i + 1) % AVATARS.length)}
              className={`w-14 h-14 rounded-full ${AVATARS[avatarIdx].color} flex items-center justify-center shadow-lg active:scale-95 transition-transform`}
              aria-label="Trocar avatar"
            >
              <Avatar className="w-8 h-8" />
            </button>
            <div>
              <p className="text-xs text-muted-foreground">Olá, pequeno explorador!</p>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-pink-600 dark:text-pink-300">
                Modo Kids
              </h1>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="rounded-full gap-1"
            onClick={() => setPinOpen(true)}
          >
            <Lock className="w-4 h-4" />
            Sair
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-pink-500" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="O que vamos assistir hoje?"
            className="pl-12 h-12 rounded-full bg-white dark:bg-white/10 border-2 border-pink-200 dark:border-pink-900 text-base"
          />
          {query && !isKidSearchSafe(query) && (
            <p className="text-xs text-red-500 mt-1 px-3">Essa busca não é permitida aqui 🙈</p>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12 text-pink-500 animate-pulse text-lg">
            Carregando diversão...
          </div>
        ) : (
          <>
            <KidsRow title="🎬 Filmes para você" items={filteredMovies} type="movie" />
            <KidsRow title="📺 Séries divertidas" items={filteredSeries} type="series" />

            {filteredMovies.length === 0 && filteredSeries.length === 0 && (
              <div className="text-center py-12">
                <p className="text-lg font-semibold">Nada por aqui ainda 🐣</p>
                <p className="text-muted-foreground text-sm">
                  Peça para um adulto adicionar conteúdo infantil.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      <KidsPinDialog
        open={pinOpen}
        onOpenChange={setPinOpen}
        onValidate={(pin) => {
          const ok = disableKidsMode(pin);
          if (ok) navigate("/");
          return ok;
        }}
      />
    </div>
  );
};

const KidsRow: React.FC<{
  title: string;
  items: (Movie | Series)[];
  type: "movie" | "series";
}> = ({ title, items, type }) => {
  if (!items.length) return null;
  return (
    <section className="space-y-3">
      <h2 className="text-xl sm:text-2xl font-extrabold text-sky-700 dark:text-sky-300">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {items.map((it) => (
          <Link
            key={it.id}
            to={type === "movie" ? `/movie/${it.id}` : `/series/${it.id}`}
            className="group rounded-3xl overflow-hidden bg-white dark:bg-white/10 shadow-md hover:shadow-2xl transition-all active:scale-95"
          >
            <div className="aspect-[2/3] overflow-hidden bg-muted">
              <img
                src={it.imageUrl}
                alt={it.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            </div>
            <div className="p-2">
              <p className="text-sm font-bold text-center truncate text-foreground">{it.title}</p>
              <div className="flex items-center justify-center gap-0.5 mt-1 text-yellow-500">
                <Star className="w-3 h-3 fill-current" />
                <Star className="w-3 h-3 fill-current" />
                <Star className="w-3 h-3 fill-current" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default KidsPage;
