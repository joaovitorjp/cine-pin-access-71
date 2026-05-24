import React from "react";
import { LiveTV } from "@/types";
import SafeImage from "@/components/SafeImage";

interface LiveTVCardProps {
  channel: LiveTV;
  onClick: () => void;
}

const LiveTVCard: React.FC<LiveTVCardProps> = ({ channel, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="block group text-left w-full"
    >
      <div className="relative overflow-hidden rounded-md transition-transform duration-300 transform group-hover:scale-105 bg-netflix-dark">
        <SafeImage
          src={channel.imageUrl}
          alt={channel.name}
          className="w-full aspect-[9/16] object-cover object-center"
        />
        <div className="absolute top-1 left-1 bg-netflix-red text-white px-1.5 py-0.5 rounded text-[10px] font-bold">
          AO VIVO
        </div>
      </div>
      <h3 className="mt-1.5 text-xs sm:text-sm font-medium text-foreground line-clamp-2 leading-tight">
        {channel.name}
      </h3>
    </button>
  );
};

export default LiveTVCard;
