
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
            ? "bg-netflix-red text-white"
            : "bg-gray-800 text-gray-300 hover:bg-gray-700"
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
              ? "bg-netflix-red text-white"
              : "bg-gray-800 text-gray-300 hover:bg-gray-700"
          )}
        >
          {genre}
        </button>
      ))}
    </div>
  );
};

export default GenreFilter;
