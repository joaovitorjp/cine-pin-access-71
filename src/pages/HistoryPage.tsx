import React from "react";
import { useHistory } from "@/contexts/HistoryContext";
import { Button } from "@/components/ui/button";
import { Clock, Trash2, Play, Film, Tv, Radio } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import SafeImage from "@/components/SafeImage";

const HistoryPage: React.FC = () => {
  const { history, clearHistory, removeFromHistory } = useHistory();

  const handleClearHistory = () => {
    clearHistory();
    toast({
      title: "Histórico limpo",
      description: "Todo o histórico de visualização foi removido.",
    });
  };

  const getIconByType = (type: string) => {
    switch (type) {
      case "movie":
        return <Film className="w-3.5 h-3.5" />;
      case "series":
        return <Tv className="w-3.5 h-3.5" />;
      case "livetv":
        return <Radio className="w-3.5 h-3.5" />;
      default:
        return <Play className="w-3.5 h-3.5" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "movie":
        return "Filme";
      case "series":
        return "Série";
      case "livetv":
        return "TV ao Vivo";
      default:
        return "";
    }
  };

  const getWatchUrl = (item: any) => {
    switch (item.type) {
      case "movie":
        return `/player/${item.id}`;
      case "series":
        return `/player/series/${item.seriesId}/${item.seasonNumber}/${item.episodeNumber}`;
      case "livetv":
        return `/livetv/player/${item.id}`;
      default:
        return "/";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Hoje";
    if (diffDays === 2) return "Ontem";
    if (diffDays <= 7) return `${diffDays - 1} dias atrás`;
    return date.toLocaleDateString("pt-BR");
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <div className="container mx-auto px-4 py-6">
        {/* Hero header */}
        <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/20 via-card to-card p-6 sm:p-8 mb-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.25),transparent_60%)] pointer-events-none" />
          <div className="relative flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0">
                <Clock className="w-7 h-7 text-primary" />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Histórico</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {history.length} {history.length === 1 ? "item assistido" : "itens assistidos"}
                </p>
              </div>
            </div>

            {history.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearHistory}
                className="rounded-xl gap-2 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
              >
                <Trash2 className="w-4 h-4" />
                Limpar
              </Button>
            )}
          </div>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-muted/40 flex items-center justify-center">
              <Clock className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Nenhum histórico ainda</h2>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Quando você assistir algum conteúdo, ele aparecerá aqui.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item) => (
              <div
                key={item.id}
                className="group relative flex items-center gap-4 p-3 rounded-2xl bg-card border border-border hover:border-primary/50 transition-colors"
              >
                <Link to={getWatchUrl(item)} className="relative w-16 h-24 sm:w-20 sm:h-28 rounded-xl overflow-hidden shrink-0 bg-muted">
                  <SafeImage
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="w-6 h-6 text-white fill-white" />
                  </div>
                </Link>

                <div className="flex-1 min-w-0">
                  <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full mb-1.5">
                    {getIconByType(item.type)}
                    {getTypeLabel(item.type)}
                  </div>
                  <h3 className="font-semibold truncate text-base leading-tight">{item.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Assistido {formatDate(item.watchedAt)}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0">
                  <Button size="sm" asChild className="rounded-xl gap-1.5">
                    <Link to={getWatchUrl(item)}>
                      <Play className="w-4 h-4" />
                      <span className="hidden sm:inline">Assistir</span>
                    </Link>
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeFromHistory(item.id)}
                    className="rounded-xl text-muted-foreground hover:text-destructive"
                    aria-label="Remover do histórico"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
