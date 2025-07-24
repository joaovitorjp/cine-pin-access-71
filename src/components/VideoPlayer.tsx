
import React from "react";

interface VideoPlayerProps {
  videoUrl: string;
  posterUrl?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl }) => {
  return (
    <div className="relative w-full aspect-video">
      <iframe
        src={videoUrl}
        className="w-full h-full absolute inset-0"
        allowFullScreen
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        style={{ border: 'none' }}
      />
    </div>
  );
};

export default VideoPlayer;
