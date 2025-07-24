
import React from "react";

interface VideoPlayerProps {
  videoUrl: string;
  posterUrl?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, posterUrl }) => {
  console.log('VideoPlayer rendering with URL:', videoUrl);
  console.log('VideoPlayer poster:', posterUrl);
  
  if (!videoUrl) {
    console.log('VideoPlayer: No video URL provided');
    return (
      <div className="relative w-full aspect-video bg-black flex items-center justify-center">
        <p className="text-white">Nenhum vídeo disponível</p>
      </div>
    );
  }

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
