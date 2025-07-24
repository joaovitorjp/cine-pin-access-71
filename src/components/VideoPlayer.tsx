
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

  // Check if URL is a direct video file
  const isDirectVideo = videoUrl.match(/\.(mp4|webm|ogg|avi|mov|wmv|flv|m3u8)(\?.*)?$/i);
  
  // Use iframe for Google Drive and other embed URLs
  if (videoUrl.includes('drive.google.com') || videoUrl.includes('preview') || !isDirectVideo) {
    return (
      <div className="relative w-full aspect-video">
        <iframe
          src={videoUrl}
          className="w-full h-full absolute inset-0"
          allowFullScreen
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          style={{ border: 'none' }}
          loading="lazy"
        />
      </div>
    );
  }

  // Use HTML5 video for direct video files
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
