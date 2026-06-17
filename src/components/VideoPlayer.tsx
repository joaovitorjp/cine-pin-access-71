import React, { useEffect, useRef } from "react";
import { ExternalLink, Play } from "lucide-react";
import { usePreferences } from "@/contexts/PreferencesContext";
import { Button } from "@/components/ui/button";

interface VideoPlayerProps {
  videoUrl: string;
  posterUrl?: string;
}

const isRunningInsideSandboxedFrame = () => {
  if (typeof window === "undefined") return false;

  let isFramed = false;
  try {
    isFramed = window.self !== window.top;
  } catch {
    isFramed = true;
  }

  if (!isFramed) return false;

  try {
    const frame = window.frameElement as HTMLIFrameElement | null;
    if (frame?.hasAttribute("sandbox")) return true;
  } catch {
    // Cross-origin preview frames can block frameElement access.
  }

  return window.location.hostname.includes("id-preview--") || document.referrer.includes("lovable");
};

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, posterUrl }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { playbackSpeed } = usePreferences();

  const isSafeUrl = (() => {
    if (typeof videoUrl !== "string" || videoUrl.trim() === "") return false;
    try {
      const u = new URL(videoUrl.trim());
      return u.protocol === "https:";
    } catch {
      return false;
    }
  })();

  if (!isSafeUrl) return null;

  const isDirectVideo = videoUrl.match(/\.(mp4|webm|ogg|avi|mov|wmv|flv|m3u8)(\?.*)?$/i);
  const isHLS = videoUrl.includes(".m3u8");
  const useExternalPlayerFallback = !isDirectVideo && isRunningInsideSandboxedFrame();

  const openExternalPlayer = () => {
    const opened = window.open(videoUrl, "_blank", "noopener,noreferrer");
    if (!opened) window.location.assign(videoUrl);
  };

  useEffect(() => {
    if (isHLS && videoRef.current) videoRef.current.src = videoUrl;
  }, [videoUrl, isHLS]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = playbackSpeed;
  }, [playbackSpeed, isDirectVideo]);

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

  if (useExternalPlayerFallback) {
    return (
      <div className="relative w-full aspect-video bg-black overflow-hidden">
        {posterUrl && (
          <img
            src={posterUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-45"
          />
        )}
        <div className="absolute inset-0 bg-black/55 flex items-center justify-center p-6">
          <Button
            type="button"
            onClick={openExternalPlayer}
            className="bg-netflix-red hover:bg-netflix-red/90 text-white h-12 px-6 gap-2"
          >
            <Play className="w-5 h-5" />
            Abrir player
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video bg-black">
      <iframe
        src={videoUrl}
        className="w-full h-full absolute inset-0"
        allowFullScreen
        referrerPolicy="no-referrer"
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        style={{ border: "none" }}
      />
    </div>
  );
};

export default VideoPlayer;
