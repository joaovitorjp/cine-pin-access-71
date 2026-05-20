import React from "react";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import FavoriteButton from "@/components/FavoriteButton";
import { Movie, Series, LiveTV } from "@/types";
import { toast } from "@/components/ui/use-toast";

interface PlayerActionsProps {
  item: Movie | Series | LiveTV;
  type: "movie" | "series" | "livetv";
  shareTitle: string;
}

const PlayerActions: React.FC<PlayerActionsProps> = ({ item, type, shareTitle }) => {
  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: shareTitle, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast({ title: "Link copiado", description: "O link foi copiado para a área de transferência." });
      }
    } catch (err) {
      // user cancelled or share failed
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <FavoriteButton item={item} type={type} variant="default" size="sm" />
      <Button variant="outline" size="sm" onClick={handleShare} className="flex items-center gap-2">
        <Share2 className="w-4 h-4" />
        Compartilhar
      </Button>
    </div>
  );
};

export default PlayerActions;
