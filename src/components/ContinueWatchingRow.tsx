import React from "react";
import { Link } from "react-router-dom";
import { X, Play } from "lucide-react";
import { useWatchProgress, WatchProgressItem } from "@/contexts/WatchProgressContext";
import { Button } from "@/components/ui/button";
import SafeImage from "@/components/SafeImage";

const formatRemaining = (totalSec: number, watchedSec: number) => {
  const remaining = Math.max(0, totalSec - watchedSec);
  const m = Math.floor(remaining / 60);
  if (m < 1) return "menos de 1 min";
  if (m < 60) return `${m} min restantes`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  return rm ? `${h}h ${rm}min restantes` : `${h}h restantes`;
};

const getLink = (it: WatchProgressItem) => {
  if (it.type === "movie") return `/player/${it.movieId}`;
  return `/player/series/${it.seriesId}/${it.seasonNumber}/${it.episodeNumber}`;
};

const ContinueWatchingRow: React.FC = () => {
  const { items, removeProgress } = useWatchProgress();

  if (items.length === 0) return null;

  return (
    <section className="space-y-3 animate-fade-in">
      <h2 className="text-xl sm:text-2xl font-bold text-foreground">Continuar Assistindo</h2>
      <div className="flex gap-3 overflow-x-auto pb-3 -mx-3 px-3 scrollbar-thin">
        {items.map(it => {
          const pct = Math.min(100, Math.round((it.watchedSeconds / it.totalSeconds) * 100));
          return (
            <div
              key={it.id}
              className="group relative shrink-0 w-[150px] sm:w-[180px] rounded-md overflow-hidden bg-card border border-border hover:scale-[1.03] transition-transform"
            >
              <Link to={getLink(it)} className="block">
                <div className="relative aspect-video bg-muted">
                  <SafeImage
                    src={it.imageUrl}
                    alt={it.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-10 h-10 rounded-full bg-primary/90 flex items-center justify-center">
                      <Play className="w-5 h-5 text-primary-foreground fill-current" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                    <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <div className="p-2 space-y-0.5">
                  <p className="text-xs font-semibold text-foreground line-clamp-1">
                    {it.type === "series" ? it.seriesTitle : it.title}
                  </p>
                  {it.type === "series" && (
                    <p className="text-[10px] text-muted-foreground line-clamp-1">
                      T{it.seasonNumber} • E{it.episodeNumber}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>{pct}%</span>
                    <span className="truncate">{formatRemaining(it.totalSeconds, it.watchedSeconds)}</span>
                  </div>
                </div>
              </Link>
              <Button
                size="icon"
                variant="secondary"
                aria-label="Remover de Continuar Assistindo"
                title="Remover de Continuar Assistindo"
                className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-90 hover:opacity-100"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  removeProgress(it.id);
                }}
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ContinueWatchingRow;
