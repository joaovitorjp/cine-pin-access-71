import React, { useEffect, useState } from "react";
import { getHomeBanners, HomeBanner } from "@/services/bannerService";

const HomeBannerCarousel: React.FC = () => {
  const [banners, setBanners] = useState<HomeBanner[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    getHomeBanners().then(setBanners).catch(() => {});
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % banners.length);
    }, 4500);
    return () => clearInterval(id);
  }, [banners.length]);

  if (banners.length === 0) return null;

  return (
    <div className="relative w-full overflow-hidden rounded-lg bg-netflix-dark aspect-[21/9] sm:aspect-[21/8] md:aspect-[21/7] shadow-lg ring-1 ring-white/5">
      {banners.map((b, i) => {
        const content = (
          <img
            src={b.url}
            alt={`Banner ${i + 1}`}
            className="w-full h-full object-cover"
            loading={i === 0 ? "eager" : "lazy"}
            onError={(e) => {
              (e.target as HTMLImageElement).style.opacity = "0";
            }}
          />
        );
        return (
          <div
            key={b.id}
            className={`absolute inset-0 transition-opacity duration-700 ${
              i === index ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            {b.link ? (
              <a href={b.link} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                {content}
              </a>
            ) : (
              content
            )}
          </div>
        );
      })}
      {/* Indicators */}
      {banners.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-6 bg-netflix-red" : "w-1.5 bg-white/50"
              }`}
              aria-label={`Ir para banner ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HomeBannerCarousel;
