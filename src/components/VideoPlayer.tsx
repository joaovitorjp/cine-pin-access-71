
import React from "react";

interface VideoPlayerProps {
  videoUrl: string;
  posterUrl?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, posterUrl }) => {
  return (
    <div className="relative w-full aspect-video">
      <video
        className="w-full h-full absolute inset-0 bg-black"
        controls
        poster={posterUrl}
        preload="metadata"
      >
        <source src={videoUrl} type="video/mp4" />
        Seu navegador não suporta a reprodução deste vídeo.
      </video>
    </div>
  );
};

export default VideoPlayer;
