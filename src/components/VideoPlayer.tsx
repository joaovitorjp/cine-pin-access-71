import React, { useEffect, useRef } from "react";
import { usePreferences } from "@/contexts/PreferencesContext";

interface VideoPlayerProps {
  videoUrl: string;
  posterUrl?: string;
}

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

  const isDirectVideo = videoUrl.match(/\.(mp4|webm|ogg|avi|mov|wmv|flv|m3u8)(\?.*)?$/i);
  const isHLS = videoUrl.includes(".m3u8");

  useEffect(() => {
    if (isHLS && videoRef.current) videoRef.current.src = videoUrl;
  }, [videoUrl, isHLS]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = playbackSpeed;
  }, [playbackSpeed, isDirectVideo]);

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
        src={videoUrl}
        title="CINE FLEX player"
        className="absolute inset-0 h-full w-full pointer-events-auto"
        tabIndex={0}
        allowFullScreen
        referrerPolicy="no-referrer"
        allow="autoplay; encrypted-media; fullscreen; picture-in-picture; clipboard-write; web-share"
        style={{ border: "none" }}
      />
    </div>
  );
};

export default VideoPlayer;
