
import React, { useEffect, useRef } from "react";

interface VideoPlayerProps {
  videoUrl: string;
  posterUrl?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, posterUrl }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check if URL is a direct video file (mp4, m3u8, etc.)
  const isDirectVideo = videoUrl.match(/\.(mp4|webm|ogg|avi|mov|wmv|flv|m3u8)(\?.*)?$/i);
  
  // Check if it's an HLS stream
  const isHLS = videoUrl.includes('.m3u8');

  useEffect(() => {
    if (isHLS && videoRef.current) {
      // For HLS streams, we might need HLS.js library in the future
      // For now, modern browsers support HLS natively
      videoRef.current.src = videoUrl;
    }
  }, [videoUrl, isHLS]);

  const handleVideoClick = () => {
    if (videoRef.current) {
      // Try to enter fullscreen and play
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
      videoRef.current.play();
    }
  };

  // If it's a direct video file, use HTML5 video element
  if (isDirectVideo) {
    return (
      <div className="relative w-full aspect-video" ref={containerRef}>
        <video
          ref={videoRef}
          className="w-full h-full absolute inset-0 bg-black"
          controls
          poster={posterUrl}
          onClick={handleVideoClick}
          onLoadedData={() => {
            // Auto-enter fullscreen and landscape on first play
            if (videoRef.current) {
              videoRef.current.addEventListener('play', handleVideoClick, { once: true });
            }
          }}
        >
          <source src={videoUrl} type={isHLS ? "application/x-mpegURL" : "video/mp4"} />
          Seu navegador não suporta a reprodução deste vídeo.
        </video>
      </div>
    );
  }

  // For iframe-based videos (YouTube, Drive, etc.)
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

export default VideoPlayer;
