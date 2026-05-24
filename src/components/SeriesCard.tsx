import React from "react";
import { Link } from "react-router-dom";
import { Series } from "@/types";
import { Tv } from "lucide-react";
import SafeImage from "@/components/SafeImage";

interface SeriesCardProps {
  series: Series;
}

const SeriesCard: React.FC<SeriesCardProps> = ({ series }) => {
  return (
    <Link to={`/series/${series.id}`} className="block group">
      <div className="relative overflow-hidden rounded-md transition-transform duration-300 transform group-hover:scale-105">
        <SafeImage
          src={series.imageUrl}
          alt={series.title}
          className="w-full aspect-[9/16] object-cover object-center"
        />
        <div className="absolute bottom-1 right-1 bg-black/70 rounded px-1.5 py-0.5 flex items-center text-[10px] text-white">
          <Tv className="w-2.5 h-2.5 mr-0.5" />
          {series.seasons.length}T
        </div>
      </div>
      <h3 className="mt-1.5 text-xs sm:text-sm font-medium text-foreground line-clamp-2 leading-tight">
        {series.title}
      </h3>
    </Link>
  );
};

export default SeriesCard;
