import React, { useEffect, useRef, useState } from "react";
import { usePreferences } from "@/contexts/PreferencesContext";
import { Loader2, ExternalLink } from "lucide-react";

interface VideoPlayerProps {
  videoUrl: string;
  posterUrl?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, posterUrl }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { playbackSpeed } = usePreferences();
  const [iframeLoading, setIframeLoading] = useState(true);
  const [iframeTimedOut, setIframeTimedOut] = useState(false);

  const isSafeUrl = (() => {
    if (typeof videoUrl !== "string" || videoUrl.trim() === "") return false;
    try {
      const u = new URL(videoUrl.trim());
      return u.protocol === "https:";
    } catch {
      return false;
    }
  })();

  const isDirectVideo = videoUrl.match(/\.(mp4|webm|ogg|avi|mov|wmv|flv|m3u8)(\?.*)?$/i);
  const isHLS = videoUrl.includes(".m3u8");

  useEffect(() => {
    if (isHLS && videoRef.current) videoRef.current.src = videoUrl;
  }, [videoUrl, isHLS]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = playbackSpeed;
  }, [playbackSpeed, isDirectVideo]);

  // Reset iframe loading state when URL changes & set a timeout fallback
  useEffect(() => {
    if (isDirectVideo) return;
    setIframeLoading(true);
    setIframeTimedOut(false);
    const t = setTimeout(() => setIframeTimedOut(true), 12000);
    return () => clearTimeout(t);
  }, [videoUrl, isDirectVideo]);

  if (!isSafeUrl) return null;

  if (isDirectVideo) {
    return (
      <div className="relative w-full aspect-video bg-black">
        <video
          ref={videoRef}
          className="w-full h-full absolute inset-0 bg-black"
          controls
          poster={posterUrl}
          onLoadedMetadata={() => {
            if (videoRef.current) videoRef.current.playbackRate = playbackSpeed;
          }}
        >
          <source src={videoUrl} type={isHLS ? "application/x-mpegURL" : "video/mp4"} />
        </video>
      </div>
    );
  }

  return (
    <div className="relative isolate w-full aspect-video overflow-hidden bg-black">
      <iframe
        ref={iframeRef}
        src={videoUrl}
        title="CINE FLEX player"
        className="absolute inset-0 h-full w-full pointer-events-auto"
        tabIndex={0}
        allowFullScreen
        // IMPORTANTE: muitos players (vidsrc, vsembed, superembed, etc.) exigem Referer
        // para liberar o stream. Usamos a política padrão do navegador.
        referrerPolicy="origin-when-cross-origin"
        allow="autoplay; encrypted-media; fullscreen; picture-in-picture; clipboard-write; web-share"
        style={{ border: "none" }}
        onLoad={() => setIframeLoading(false)}
      />

      {iframeLoading && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white">
          <Loader2 className="w-8 h-8 animate-spin text-netflix-red mb-2" />
          <span className="text-sm text-white/80">Carregando player...</span>
        </div>
      )}

      {iframeLoading && iframeTimedOut && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-netflix-red px-4 py-2 text-xs font-medium text-white shadow-lg hover:bg-netflix-red/90"
          >
            <ExternalLink className="w-4 h-4" />
            Abrir player em nova guia
          </a>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
