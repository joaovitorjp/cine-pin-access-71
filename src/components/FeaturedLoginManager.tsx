import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { Movie, Series, LiveTV } from "@/types";
import { getAllMovies } from "@/services/movieService";
import { getAllSeries } from "@/services/seriesService";
import { getAllLiveTVChannels } from "@/services/liveTvService";
import {
  FeaturedItem,
  FeaturedType,
  getFeaturedLoginItems,
  setFeaturedLoginItems,
} from "@/services/featuredLoginService";
import { Save, Star, Film, Tv, Radio } from "lucide-react";

interface Entry {
  id: string;
  type: FeaturedType;
  title: string;
  imageUrl: string;
}

const FeaturedLoginManager: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [series, setSeries] = useState<Series[]>([]);
  const [channels, setChannels] = useState<LiveTV[]>([]);
  const [selected, setSelected] = useState<Map<string, FeaturedType>>(new Map());
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [m, s, c, items] = await Promise.all([
          getAllMovies(),
          getAllSeries(),
          getAllLiveTVChannels(),
          getFeaturedLoginItems(),
        ]);
        setMovies(m);
        setSeries(s);
        setChannels(c);
        const map = new Map<string, FeaturedType>();
        items.forEach(it => map.set(`${it.type}:${it.id}`, it.type));
        setSelected(map);
      } catch (e) {
        console.error(e);
        toast({ title: "Erro ao carregar conteúdo", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const toggle = (type: FeaturedType, id: string) => {
    const key = `${type}:${id}`;
    setSelected(prev => {
      const next = new Map(prev);
      if (next.has(key)) next.delete(key);
      else next.set(key, type);
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const items: FeaturedItem[] = [];
      // Mantém a ordem por tipo
      movies.forEach(m => {
        if (selected.has(`movie:${m.id}`)) items.push({ id: m.id, type: "movie" });
      });
      series.forEach(s => {
        if (selected.has(`series:${s.id}`)) items.push({ id: s.id, type: "series" });
      });
      channels.forEach(c => {
        if (selected.has(`channel:${c.id}`)) items.push({ id: c.id, type: "channel" });
      });
      await setFeaturedLoginItems(items);
      toast({ title: "Destaques salvos", description: `${items.length} item(ns) no carrossel.` });
    } catch (e) {
      console.error(e);
      toast({ title: "Erro ao salvar", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const moviesEntries: Entry[] = useMemo(
    () => movies.map(m => ({ id: m.id, type: "movie", title: m.title, imageUrl: m.imageUrl })),
    [movies]
  );
  const seriesEntries: Entry[] = useMemo(
    () => series.map(s => ({ id: s.id, type: "series", title: s.title, imageUrl: s.imageUrl })),
    [series]
  );
  const channelEntries: Entry[] = useMemo(
    () => channels.map(c => ({ id: c.id, type: "channel", title: c.name, imageUrl: c.imageUrl })),
    [channels]
  );

  const filterBy = (list: Entry[]) =>
    list.filter(e => e.title.toLowerCase().includes(search.toLowerCase()));

  const renderGrid = (list: Entry[]) => {
    if (list.length === 0) {
      return (
        <div className="text-netflix-gray bg-netflix-dark p-6 rounded-md text-center">
          Nenhum item encontrado.
        </div>
      );
    }
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {list.map((e) => {
          const key = `${e.type}:${e.id}`;
          const isOn = selected.has(key);
          return (
            <button
              key={key}
              type="button"
              onClick={() => toggle(e.type, e.id)}
              className={`relative rounded-lg overflow-hidden border-2 transition-all text-left ${
                isOn
                  ? "border-netflix-red ring-2 ring-netflix-red/50"
                  : "border-gray-700 hover:border-gray-500"
              }`}
            >
              <div className="aspect-[2/3] bg-gray-800">
                <img
                  src={e.imageUrl}
                  alt={e.title}
                  className="w-full h-full object-cover"
                  onError={(ev) => {
                    (ev.target as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b";
                  }}
                />
              </div>
              <div className="absolute top-2 right-2 bg-black/70 rounded p-1">
                <Checkbox checked={isOn} className="pointer-events-none" />
              </div>
              <div className="p-2 bg-netflix-dark">
                <p className="text-xs font-medium text-white line-clamp-2">{e.title}</p>
              </div>
            </button>
          );
        })}
      </div>
    );
  };

  const movieCount = Array.from(selected.values()).filter(t => t === "movie").length;
  const seriesCount = Array.from(selected.values()).filter(t => t === "series").length;
  const channelCount = Array.from(selected.values()).filter(t => t === "channel").length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" />
            Destaques na Tela de Login
          </h2>
          <p className="text-sm text-netflix-gray mt-1">
            Selecione filmes, séries e canais que aparecerão no carrossel antes do login.
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving || loading}
          className="bg-netflix-red hover:bg-red-700"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Salvando..." : `Salvar (${selected.size})`}
        </Button>
      </div>

      <Input
        placeholder="Pesquisar..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="bg-gray-700 border-gray-600"
      />

      {loading ? (
        <div className="text-netflix-gray animate-pulse">Carregando conteúdo...</div>
      ) : (
        <Tabs defaultValue="movies" className="w-full">
          <TabsList className="bg-netflix-dark">
            <TabsTrigger value="movies" className="data-[state=active]:bg-netflix-red">
              <Film className="w-4 h-4 mr-2" /> Filmes ({movieCount})
            </TabsTrigger>
            <TabsTrigger value="series" className="data-[state=active]:bg-netflix-red">
              <Tv className="w-4 h-4 mr-2" /> Séries ({seriesCount})
            </TabsTrigger>
            <TabsTrigger value="channels" className="data-[state=active]:bg-netflix-red">
              <Radio className="w-4 h-4 mr-2" /> Canais ({channelCount})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="movies" className="mt-4">
            {renderGrid(filterBy(moviesEntries))}
          </TabsContent>
          <TabsContent value="series" className="mt-4">
            {renderGrid(filterBy(seriesEntries))}
          </TabsContent>
          <TabsContent value="channels" className="mt-4">
            {renderGrid(filterBy(channelEntries))}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default FeaturedLoginManager;
