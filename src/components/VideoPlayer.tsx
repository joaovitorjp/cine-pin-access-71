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
  const containerRef = useRef<HTMLDivElement>(null);
  const { playbackSpeed } = usePreferences();
  const [iframeLoading, setIframeLoading] = useState(true);
  const [iframeTimedOut, setIframeTimedOut] = useState(false);
  const [vimeoAspect, setVimeoAspect] = useState<number | null>(null);
  const [containerAspect, setContainerAspect] = useState<number>(16 / 9);

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
  const isVimeo = videoUrl.includes("player.vimeo.com") || videoUrl.includes("vimeo.com");

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

  // For Vimeo: fetch real video aspect via oEmbed so we can scale-to-cover
  useEffect(() => {
    if (!isVimeo) {
      setVimeoAspect(null);
      return;
    }
    const id = videoUrl.match(/(?:video\/|vimeo\.com\/)(\d+)/)?.[1];
    if (!id) return;
    let hash = "";
    try {
      const u = new URL(videoUrl);
      hash = u.searchParams.get("h") || "";
    } catch {
      /* noop */
    }
    const vimeoUrl = hash
      ? `https://vimeo.com/${id}/${hash}`
      : `https://vimeo.com/${id}`;
    let cancelled = false;
    fetch(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(vimeoUrl)}`)
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        if (d?.width && d?.height) setVimeoAspect(d.width / d.height);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [videoUrl, isVimeo]);

  // Track container aspect to compute cover-scale for Vimeo
  useEffect(() => {
    if (!isVimeo || !containerRef.current) return;
    const el = containerRef.current;
    const update = () => {
      if (el.clientHeight > 0) setContainerAspect(el.clientWidth / el.clientHeight);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [isVimeo, videoUrl]);


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

  // Compute scale so the Vimeo iframe content covers the container (no letterbox).
  // The Vimeo iframe auto-fits its video to its own bounds with letterboxing.
  // To kill the bars, we resize the iframe to the video's aspect ratio and scale it up to cover the container.
  let vimeoIframeStyle: React.CSSProperties = { border: "none" };
  if (isVimeo && vimeoAspect && containerAspect) {
    // Width/height of an iframe that matches the video's aspect, fitted inside container (contain).
    // Then scale up so it covers the container.
    const scale =
      vimeoAspect > containerAspect
        ? vimeoAspect / containerAspect // video wider than container -> scale to fill height
        : containerAspect / vimeoAspect; // video taller -> scale to fill width
    vimeoIframeStyle = {
      border: "none",
      transform: `translate(-50%, -50%) scale(${scale})`,
      transformOrigin: "center center",
      top: "50%",
      left: "50%",
      position: "absolute",
      width: "100%",
      height: "100%",
    };
  }

  return (
    <div ref={containerRef} className="relative isolate w-full aspect-video overflow-hidden bg-black">
      <iframe
        ref={iframeRef}
        src={videoUrl}
        title="CINE FLEX player"
        className={
          isVimeo && vimeoAspect
            ? "pointer-events-auto"
            : "absolute inset-0 h-full w-full pointer-events-auto"
        }
        tabIndex={0}
        allowFullScreen
        // IMPORTANTE: muitos players (vidsrc, vsembed, superembed, etc.) exigem Referer
        // para liberar o stream. Usamos a política padrão do navegador.
        referrerPolicy="origin-when-cross-origin"
        allow="autoplay; encrypted-media; fullscreen; picture-in-picture; clipboard-write; web-share"
        style={vimeoIframeStyle}
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
