import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LiveTV } from "@/types";

interface LiveTVCardProps {
  channel: LiveTV;
  onClick: () => void;
}

const LiveTVCard: React.FC<LiveTVCardProps> = ({ channel, onClick }) => {
  return (
    <Card 
      className="bg-netflix-dark border-gray-700 hover:border-netflix-red transition-all duration-300 cursor-pointer transform hover:scale-105"
      onClick={onClick}
    >
      <CardContent className="p-0">
        <div className="relative aspect-video overflow-hidden rounded-t-lg">
          <img
            src={channel.imageUrl}
            alt={channel.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37";
            }}
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="bg-netflix-red text-white px-3 py-1 rounded-full text-sm font-medium">
              AO VIVO
            </div>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-white text-sm mb-2 line-clamp-2">
            {channel.name}
          </h3>
          {channel.category && (
            <p className="text-netflix-gray text-xs">
              {channel.category}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LiveTVCard;