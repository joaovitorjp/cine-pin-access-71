import React from "react";
import { useHistory } from "@/contexts/HistoryContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Trash2, Play, Film, Tv, Radio } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";

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
      case 'movie':
        return <Film className="w-4 h-4" />;
      case 'series':
        return <Tv className="w-4 h-4" />;
      case 'livetv':
        return <Radio className="w-4 h-4" />;
      default:
        return <Play className="w-4 h-4" />;
    }
  };

  const getWatchUrl = (item: any) => {
    switch (item.type) {
      case 'movie':
        return `/player/${item.id}`;
      case 'series':
        return `/player/series/${item.seriesId}/${item.seasonNumber}/${item.episodeNumber}`;
      case 'livetv':
        return `/livetv/player/${item.id.split('-')[0]}`; // Remove episode suffix if any
      default:
        return '/';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return "Hoje";
    } else if (diffDays === 2) {
      return "Ontem";
    } else if (diffDays <= 7) {
      return `${diffDays - 1} dias atrás`;
    } else {
      return date.toLocaleDateString('pt-BR');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 pb-20">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Histórico</h1>
            <span className="text-muted-foreground">({history.length})</span>
          </div>
          
          {history.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearHistory}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Limpar Histórico
            </Button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Nenhum histórico ainda</h2>
            <p className="text-muted-foreground">
              Quando você assistir algum conteúdo, aparecerá aqui
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item) => (
              <Card key={item.id} className="hover:bg-muted/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-16 h-24 object-cover rounded-md"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getIconByType(item.type)}
                        <h3 className="font-semibold truncate">{item.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Assistido {formatDate(item.watchedAt)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button size="sm" asChild>
                        <Link to={getWatchUrl(item)}>
                          <Play className="w-4 h-4 mr-1" />
                          Assistir
                        </Link>
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFromHistory(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;