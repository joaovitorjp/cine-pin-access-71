
import React from "react";
import { Link } from "react-router-dom";
import { Movie } from "@/types";
import { Star, Calendar } from "lucide-react";

interface MovieCardProps {
  movie: Movie;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  return (
    <Link to={`/movie/${movie.id}`} className="block group">
      <div className="relative overflow-hidden rounded-md transition-transform duration-300 transform hover:scale-105 hover:z-50">
        <img
          src={movie.imageUrl}
          alt={movie.title}
          className="w-full aspect-[9/16] object-cover object-center"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            <h3 className="font-bold text-xs sm:text-sm text-white line-clamp-2">
              {movie.title}
            </h3>
            <div className="flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
              {movie.year && (
                <div className="flex items-center text-xs text-gray-300">
                  <Calendar className="w-3 h-3 mr-0.5" />
                  <span>{movie.year}</span>
                </div>
              )}
              {movie.rating && (
                <div className="flex items-center text-xs">
                  <Star className="w-3 h-3 mr-0.5 text-yellow-400" />
                  <span className="text-white">{movie.rating}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default MovieCard;
