import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Gauge, PictureInPicture2 } from "lucide-react";
import { PLAYBACK_SPEEDS, usePreferences } from "@/contexts/PreferencesContext";
import { toast } from "@/components/ui/use-toast";

interface VideoPlayerProps {
  videoUrl: string;
  posterUrl?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, posterUrl }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { playbackSpeed, setPlaybackSpeed } = usePreferences();
  const [currentSpeed, setCurrentSpeed] = useState<number>(playbackSpeed);

  // Hardened URL validation: only allow https:// absolute URLs.
  // Blocks javascript:, data:, vbscript:, file:, http:, relative paths, etc.
  const isSafeUrl = (() => {
    if (typeof videoUrl !== "string" || videoUrl.trim() === "") return false;
    try {
      const u = new URL(videoUrl.trim());
      return u.protocol === "https:";
    } catch {
      return false;
    }
  })();

  if (!isSafeUrl) {
    return (
      <div className="w-full aspect-video flex items-center justify-center bg-black text-netflix-gray text-sm px-4 text-center">
        URL de vídeo inválida ou insegura. Apenas links HTTPS são permitidos.
      </div>
    );
  }

  const isDirectVideo = videoUrl.match(/\.(mp4|webm|ogg|avi|mov|wmv|flv|m3u8)(\?.*)?$/i);
  const isHLS = videoUrl.includes(".m3u8");

  useEffect(() => {
    if (isHLS && videoRef.current) videoRef.current.src = videoUrl;
  }, [videoUrl, isHLS]);

  // Apply saved playback speed to HTML5 video
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
      setCurrentSpeed(playbackSpeed);
    }
  }, [playbackSpeed, isDirectVideo]);

  const handleSpeedChange = (s: number) => {
    setPlaybackSpeed(s as any);
    setCurrentSpeed(s);
    if (videoRef.current) videoRef.current.playbackRate = s;
    toast({ title: `Velocidade ${s}x` });
  };

  const enterPiP = async () => {
    try {
      if (videoRef.current && document.pictureInPictureEnabled) {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
        } else {
          await videoRef.current.requestPictureInPicture();
        }
      } else if (iframeRef.current) {
        // Best-effort: try fullscreen as PiP fallback for iframes (cross-origin PiP not controllable)
        if (iframeRef.current.requestFullscreen) {
          await iframeRef.current.requestFullscreen();
        } else {
          toast({
            title: "PiP indisponível",
            description: "Este player externo não permite controle de PiP a partir do app.",
            variant: "destructive",
          });
        }
      }
    } catch {
      toast({ title: "Não foi possível ativar o PiP", variant: "destructive" });
    }
  };

  // Floating controls overlay
  const Controls = (
    <div className="absolute top-2 right-2 z-10 flex gap-1">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            variant="secondary"
            className="h-8 px-2 bg-black/60 text-white hover:bg-black/80 backdrop-blur"
          >
            <Gauge className="w-4 h-4 mr-1" /> {currentSpeed}x
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {PLAYBACK_SPEEDS.map((s) => (
            <DropdownMenuItem key={s} onClick={() => handleSpeedChange(s)}>
              {s}x {currentSpeed === s && "✓"}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <Button
        size="sm"
        variant="secondary"
        onClick={enterPiP}
        className="h-8 px-2 bg-black/60 text-white hover:bg-black/80 backdrop-blur"
        title="Picture-in-Picture"
      >
        <PictureInPicture2 className="w-4 h-4" />
      </Button>
    </div>
  );

  if (isDirectVideo) {
    return (
      <div className="relative w-full aspect-video" ref={containerRef}>
        {Controls}
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
          Seu navegador não suporta a reprodução deste vídeo.
        </video>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="relative w-full aspect-video" ref={containerRef}>
        {Controls}
        <iframe
          ref={iframeRef}
          src={videoUrl}
          className="w-full h-full absolute inset-0"
          allowFullScreen
          referrerPolicy="no-referrer"
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen; accelerometer; gyroscope"
          sandbox="allow-forms allow-pointer-lock allow-same-origin allow-scripts allow-top-navigation"
          style={{ border: "none" }}
          loading="lazy"
        />
      </div>
    </div>
  );
};

export default VideoPlayer;
