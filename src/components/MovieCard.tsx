import React from "react";
import { Link } from "react-router-dom";
import { Movie } from "@/types";
import { Star, Calendar } from "lucide-react";
import SafeImage from "@/components/SafeImage";

interface MovieCardProps {
  movie: Movie;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  return (
    <Link to={`/movie/${movie.id}`} className="block group">
      <div className="relative overflow-hidden rounded-md transition-transform duration-300 transform group-hover:scale-105">
        <SafeImage
          src={movie.imageUrl}
          alt={movie.title}
          className="w-full aspect-[9/16] object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-1 left-1 right-1 flex items-center gap-2">
            {movie.year && (
              <div className="flex items-center text-[10px] text-gray-200">
                <Calendar className="w-2.5 h-2.5 mr-0.5" />
                <span>{movie.year}</span>
              </div>
            )}
            {movie.rating && (
              <div className="flex items-center text-[10px]">
                <Star className="w-2.5 h-2.5 mr-0.5 text-yellow-400" />
                <span className="text-white">{movie.rating}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <h3 className="mt-1.5 text-xs sm:text-sm font-medium text-foreground line-clamp-2 leading-tight">
        {movie.title}
      </h3>
    </Link>
  );
};

export default MovieCard;
