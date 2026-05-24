import React, { useEffect, useRef, useState } from "react";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { getMirroredUrl, scheduleMirror } from "@/lib/mirror";

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt: string;
  fallbackClassName?: string;
  /** Disable the transparent CDN mirroring layer. */
  noMirror?: boolean;
}

/**
 * Image with graceful error state + transparent mirroring through our Storage
 * CDN. We try the mirrored URL first; if it doesn't exist yet, we fall back to
 * the original source and schedule a background mirror so subsequent loads are
 * served from the CDN.
 */
const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  className,
  fallbackClassName,
  noMirror,
  ...rest
}) => {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string | undefined>(undefined);
  // Tracks whether we are currently displaying the mirrored URL (so the first
  // error means "mirror missing — fall back to original")
  const triedMirror = useRef(false);

  useEffect(() => {
    let cancelled = false;
    setFailed(false);
    setLoaded(false);
    triedMirror.current = false;

    if (!src) {
      setCurrentSrc(undefined);
      return;
    }

    if (noMirror) {
      setCurrentSrc(src);
      return;
    }

    (async () => {
      const mirrored = await getMirroredUrl(src);
      if (cancelled) return;
      if (mirrored) {
        triedMirror.current = true;
        setCurrentSrc(mirrored);
        // Ensure it gets mirrored for next loads
        scheduleMirror(src);
      } else {
        setCurrentSrc(src);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [src, noMirror]);

  const handleError = () => {
    if (triedMirror.current && src && currentSrc !== src) {
      // Mirror not available yet — fall back to the original URL and queue it
      triedMirror.current = false;
      scheduleMirror(src);
      setCurrentSrc(src);
      return;
    }
    setFailed(true);
  };

  if (!src || failed) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center bg-muted text-muted-foreground gap-1 p-2 text-center",
          className,
          fallbackClassName
        )}
        role="img"
        aria-label={alt}
      >
        <ImageOff className="w-6 h-6 opacity-60" />
        <span className="text-[10px] line-clamp-2 leading-tight">{alt}</span>
      </div>
    );
  }

  return (
    <>
      {!loaded && (
        <div
          className={cn("animate-pulse bg-muted absolute inset-0", className)}
          aria-hidden
        />
      )}
      {currentSrc && (
        <img
          src={currentSrc}
          alt={alt}
          className={className}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={handleError}
          {...rest}
        />
      )}
    </>
  );
};

export default SafeImage;
