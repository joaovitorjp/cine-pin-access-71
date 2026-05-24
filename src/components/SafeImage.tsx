import React, { useState } from "react";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt: string;
  fallbackClassName?: string;
}

const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  className,
  fallbackClassName,
  ...rest
}) => {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

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
      <img
        src={src}
        alt={alt}
        className={className}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        {...rest}
      />
    </>
  );
};

export default SafeImage;
