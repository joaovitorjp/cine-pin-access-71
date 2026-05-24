import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { EditorCollection, subscribeCollections } from "@/services/collectionsService";
import { Movie, Series } from "@/types";
import { Sparkles } from "lucide-react";
import SafeImage from "@/components/SafeImage";

interface Props {
  movies: Movie[];
  series: Series[];
}

const EditorsCollectionsSection: React.FC<Props> = ({ movies, series }) => {
  const [collections, setCollections] = useState<EditorCollection[]>([]);

  useEffect(() => {
    const unsub = subscribeCollections((list) =>
      setCollections(list.filter((c) => c.featured && c.items?.length))
    );
    return unsub;
  }, []);

  const moviesMap = useMemo(() => new Map(movies.map((m) => [m.id, m])), [movies]);
  const seriesMap = useMemo(() => new Map(series.map((s) => [s.id, s])), [series]);

  if (!collections.length) return null;

  return (
    <section className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-primary" />
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">Coleções do Editor</h2>
      </div>

      {collections.map((c) => {
        const resolved = c.items
          .map((it) =>
            it.type === "movie"
              ? moviesMap.get(it.id) && { ...moviesMap.get(it.id)!, _type: "movie" as const }
              : seriesMap.get(it.id) && { ...seriesMap.get(it.id)!, _type: "series" as const }
          )
          .filter(Boolean) as ((Movie | Series) & { _type: "movie" | "series" })[];

        if (!resolved.length) return null;

        return (
          <div key={c.id} className="space-y-2">
            {c.bannerUrl ? (
              <div className="relative rounded-xl overflow-hidden h-32 sm:h-40">
                <img src={c.bannerUrl} alt={c.title} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 text-white">
                  <h3 className="text-lg sm:text-xl font-bold">{c.title}</h3>
                  {c.description && <p className="text-xs sm:text-sm opacity-90 line-clamp-1">{c.description}</p>}
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-lg sm:text-xl font-bold">{c.title}</h3>
                {c.description && <p className="text-xs sm:text-sm text-muted-foreground">{c.description}</p>}
              </div>
            )}

            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-2 sm:gap-3">
              {resolved.slice(0, 16).map((item) => (
                <Link
                  key={`${item._type}-${item.id}`}
                  to={item._type === "movie" ? `/movie/${item.id}` : `/series/${item.id}`}
                  className="group rounded-md overflow-hidden bg-card hover:scale-105 transition-transform"
                >
                  <div className="aspect-[2/3] bg-muted">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-xs p-1 truncate text-foreground">{item.title}</p>
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
};

export default EditorsCollectionsSection;
