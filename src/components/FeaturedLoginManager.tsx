import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";
import { Movie } from "@/types";
import { getAllMovies } from "@/services/movieService";
import {
  getFeaturedLoginMovieIds,
  setFeaturedLoginMovieIds,
} from "@/services/featuredLoginService";
import { Save, Star } from "lucide-react";

/**
 * Permite ao admin escolher quais filmes aparecem no carrossel
 * da tela de login (antes do PIN).
 */
const FeaturedLoginManager: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [all, ids] = await Promise.all([
          getAllMovies(),
          getFeaturedLoginMovieIds(),
        ]);
        setMovies(all);
        setSelected(new Set(ids));
      } catch (e) {
        console.error(e);
        toast({ title: "Erro ao carregar filmes", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Mantém a ordem dos filmes (ordem em `movies`) ao salvar
      const ordered = movies.filter(m => selected.has(m.id)).map(m => m.id);
      await setFeaturedLoginMovieIds(ordered);
      toast({ title: "Destaques salvos", description: `${ordered.length} filme(s) no carrossel.` });
    } catch (e) {
      console.error(e);
      toast({ title: "Erro ao salvar", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const filtered = movies.filter(m =>
    m.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" />
            Filmes em Destaque (Tela de Login)
          </h2>
          <p className="text-sm text-netflix-gray mt-1">
            Selecione os filmes que aparecerão no carrossel diagonal antes do login.
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
        placeholder="Pesquisar filme..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="bg-gray-700 border-gray-600"
      />

      {loading ? (
        <div className="text-netflix-gray animate-pulse">Carregando filmes...</div>
      ) : filtered.length === 0 ? (
        <div className="text-netflix-gray bg-netflix-dark p-6 rounded-md text-center">
          Nenhum filme encontrado.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filtered.map((movie) => {
            const isOn = selected.has(movie.id);
            return (
              <button
                key={movie.id}
                type="button"
                onClick={() => toggle(movie.id)}
                className={`relative rounded-lg overflow-hidden border-2 transition-all text-left ${
                  isOn
                    ? "border-netflix-red ring-2 ring-netflix-red/50"
                    : "border-gray-700 hover:border-gray-500"
                }`}
              >
                <div className="aspect-[2/3] bg-gray-800">
                  <img
                    src={movie.imageUrl}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b";
                    }}
                  />
                </div>
                <div className="absolute top-2 right-2 bg-black/70 rounded p-1">
                  <Checkbox checked={isOn} className="pointer-events-none" />
                </div>
                <div className="p-2 bg-netflix-dark">
                  <p className="text-xs font-medium text-white line-clamp-2">{movie.title}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FeaturedLoginManager;
