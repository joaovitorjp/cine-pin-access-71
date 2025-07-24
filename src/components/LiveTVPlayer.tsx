import React, { useRef } from "react";

interface LiveTVPlayerProps {
  videoUrl: string;
  posterUrl?: string;
}

const LiveTVPlayer: React.FC<LiveTVPlayerProps> = ({ videoUrl, posterUrl }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Check if URL is a direct video file (mp4, m3u8, etc.)
  const isDirectVideo = videoUrl.match(/\.(mp4|webm|ogg|avi|mov|wmv|flv|m3u8)(\?.*)?$/i);
  
  // Check if it's an HLS stream
  const isHLS = videoUrl.includes('.m3u8');

  const handleVideoClick = () => {
    if (videoRef.current) {
      // Try to enter fullscreen and play
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
      videoRef.current.play();
    }
  };

  // For direct video files or HLS streams, use HTML5 video element
  if (isDirectVideo || isHLS) {
    return (
      <div className="relative w-full aspect-video">
        <video
          ref={videoRef}
          className="w-full h-full absolute inset-0 bg-black"
          controls
          poster={posterUrl}
          onClick={handleVideoClick}
          autoPlay
          muted
        >
          <source src={videoUrl} type={isHLS ? "application/x-mpegURL" : "video/mp4"} />
          Canal não suportado pelo seu navegador.
        </video>
      </div>
    );
  }

  // For any other URL (streaming services, etc.), use iframe
  return (
    <div className="relative w-full aspect-video">
      <iframe
        src={videoUrl}
        className="w-full h-full absolute inset-0"
        allowFullScreen
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen; accelerometer; gyroscope"
        style={{ border: 'none' }}
        loading="lazy"
      />
    </div>
  );
};

export default LiveTVPlayer;