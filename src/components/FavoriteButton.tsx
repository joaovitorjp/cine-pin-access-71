import React from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useFavorites } from "@/contexts/FavoritesContext";
import { Movie, Series, LiveTV } from "@/types";
import { toast } from "@/components/ui/use-toast";

interface FavoriteButtonProps {
  item: Movie | Series | LiveTV;
  type: 'movie' | 'series' | 'livetv';
  variant?: "default" | "ghost";
  size?: "sm" | "default" | "lg";
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ 
  item, 
  type, 
  variant = "ghost", 
  size = "sm" 
}) => {
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const isItemFavorite = isFavorite(item.id, type);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const itemTitle = 'title' in item ? item.title : item.name;
    
    if (isItemFavorite) {
      removeFromFavorites(item.id, type);
      toast({
        title: "Removido dos favoritos",
        description: `${itemTitle} foi removido dos favoritos.`,
      });
    } else {
      addToFavorites(item, type);
      toast({
        title: "Adicionado aos favoritos",
        description: `${itemTitle} foi adicionado aos favoritos.`,
      });
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggleFavorite}
      className={`flex items-center gap-2 ${isItemFavorite ? 'text-red-500' : ''}`}
    >
      <Heart 
        className={`w-4 h-4 ${isItemFavorite ? 'fill-current' : ''}`} 
      />
      {isItemFavorite ? 'Favoritado' : 'Favoritar'}
    </Button>
  );
};

export default FavoriteButton;