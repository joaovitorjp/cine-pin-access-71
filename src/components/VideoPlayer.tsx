
import React, { useRef, useEffect } from "react";

interface VideoPlayerProps {
  videoUrl: string;
  posterUrl?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleFullscreen = async () => {
    try {
      if (containerRef.current) {
        await containerRef.current.requestFullscreen();
        
        // Forçar orientação paisagem se disponível
        if ('screen' in window && 'orientation' in window.screen) {
          try {
            await (window.screen.orientation as any).lock('landscape');
          } catch (error) {
            console.log('Orientação paisagem não suportada:', error);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao entrar em tela cheia:', error);
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IFRAME' || container.contains(target)) {
        handleFullscreen();
      }
    };

    container.addEventListener('click', handleClick);
    
    return () => {
      container.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full aspect-video cursor-pointer"
      onClick={handleFullscreen}
    >
      <iframe
        ref={iframeRef}
        src={videoUrl}
        className="w-full h-full absolute inset-0"
        allowFullScreen
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        sandbox="allow-scripts allow-same-origin allow-presentation"
        style={{ border: 'none' }}
      />
    </div>
  );
};

export default VideoPlayer;
