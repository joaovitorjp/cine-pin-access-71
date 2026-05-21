
import React from "react";
import { cn } from "@/lib/utils";

interface GenreFilterProps {
  genres: string[];
  selectedGenre: string;
  onGenreSelect: (genre: string) => void;
}

const GenreFilter: React.FC<GenreFilterProps> = ({
  genres,
  selectedGenre,
  onGenreSelect,
}) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <button
        onClick={() => onGenreSelect("all")}
        className={cn(
          "px-4 py-1 rounded-full text-sm whitespace-nowrap transition-colors",
          selectedGenre === "all"
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        )}
      >
        Todos
      </button>
      {genres.map((genre) => (
        <button
          key={genre}
          onClick={() => onGenreSelect(genre)}
          className={cn(
            "px-4 py-1 rounded-full text-sm whitespace-nowrap transition-colors",
            selectedGenre === genre
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          )}
        >
          {genre}
        </button>
      ))}
    </div>
  );
};

export default GenreFilter;
