import React, { useEffect, useMemo, useState } from "react";
import {
  EditorCollection,
  createCollection,
  deleteCollection,
  subscribeCollections,
  updateCollection,
} from "@/services/collectionsService";
import { getAllMovies } from "@/services/movieService";
import { getAllSeries } from "@/services/seriesService";
import { Movie, Series } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Pencil, Trash2, Sparkles, Star } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const EMPTY: Omit<EditorCollection, "id" | "createdAt" | "updatedAt"> = {
  title: "",
  description: "",
  bannerUrl: "",
  coverUrl: "",
  featured: true,
  items: [],
  order: 0,
};

const CollectionsManager: React.FC = () => {
  const [collections, setCollections] = useState<EditorCollection[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [series, setSeries] = useState<Series[]>([]);
  const [editing, setEditing] = useState<EditorCollection | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const unsub = subscribeCollections(setCollections);
    Promise.all([getAllMovies(), getAllSeries()]).then(([m, s]) => {
      setMovies(m); setSeries(s);
    });
    return unsub;
  }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ ...EMPTY, order: collections.length });
    setOpen(true);
  };
  const openEdit = (c: EditorCollection) => {
    setEditing(c);
    setForm({
      title: c.title,
      description: c.description || "",
      bannerUrl: c.bannerUrl || "",
      coverUrl: c.coverUrl || "",
      featured: c.featured,
      items: c.items || [],
      order: c.order ?? 0,
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.title.trim()) {
      toast({ title: "Título obrigatório", variant: "destructive" });
      return;
    }
    try {
      if (editing) {
        await updateCollection(editing.id, form);
        toast({ title: "Coleção atualizada" });
      } else {
        await createCollection(form);
        toast({ title: "Coleção criada" });
      }
      setOpen(false);
    } catch (e) {
      console.error(e);
      toast({ title: "Erro ao salvar", variant: "destructive" });
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Excluir esta coleção?")) return;
    await deleteCollection(id);
    toast({ title: "Coleção removida" });
  };

  const toggleItem = (id: string, type: "movie" | "series") => {
    const exists = form.items.some((i) => i.id === id && i.type === type);
    setForm({
      ...form,
      items: exists
        ? form.items.filter((i) => !(i.id === id && i.type === type))
        : [...form.items, { id, type }],
    });
  };

  const filteredMovies = useMemo(
    () => movies.filter((m) => m.title.toLowerCase().includes(search.toLowerCase())),
    [movies, search]
  );
  const filteredSeries = useMemo(
    () => series.filter((s) => s.title.toLowerCase().includes(search.toLowerCase())),
    [series, search]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-xl md:text-2xl font-semibold flex items-center gap-2">
          <Sparkles className="w-5 h-5" /> Coleções do Editor ({collections.length})
        </h2>
        <Button onClick={openNew} className="bg-netflix-red hover:bg-red-700">
          <Plus className="w-4 h-4 mr-2" /> Nova coleção
        </Button>
      </div>

      {collections.length === 0 ? (
        <div className="text-muted-foreground bg-card p-6 rounded-md text-center border border-border">
          Nenhuma coleção criada ainda.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {collections.map((c) => (
            <div key={c.id} className="bg-card border border-border rounded-md overflow-hidden">
              {c.bannerUrl && (
                <img src={c.bannerUrl} alt={c.title} className="w-full h-24 object-cover" />
              )}
              <div className="p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold truncate">{c.title}</h3>
                    {c.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{c.description}</p>
                    )}
                  </div>
                  {c.featured && (
                    <Badge className="gap-1"><Star className="w-3 h-3" /> Destaque</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{c.items?.length || 0} itens</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(c)}>
                    <Pencil className="w-3 h-3 mr-1" /> Editar
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => remove(c.id)}>
                    <Trash2 className="w-3 h-3 mr-1" /> Excluir
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[95vw] max-w-[700px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar coleção" : "Nova coleção"}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] pr-4">
            <div className="space-y-3">
              <div>
                <Label>Título *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  maxLength={80}
                  placeholder="Ex: Vencedores do Oscar"
                />
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  maxLength={200}
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label>URL do banner (largo)</Label>
                  <Input
                    value={form.bannerUrl}
                    onChange={(e) => setForm({ ...form, bannerUrl: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <Label>URL da capa (quadrada)</Label>
                  <Input
                    value={form.coverUrl}
                    onChange={(e) => setForm({ ...form, coverUrl: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <Label>Destacar na tela inicial</Label>
                  <p className="text-xs text-muted-foreground">Exibe esta coleção na home.</p>
                </div>
                <Switch
                  checked={form.featured}
                  onCheckedChange={(v) => setForm({ ...form, featured: v })}
                />
              </div>
              <div>
                <Label>Ordem</Label>
                <Input
                  type="number"
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: Number(e.target.value) || 0 })}
                />
              </div>

              <div className="border-t pt-3">
                <Label>Selecionar itens ({form.items.length} selecionados)</Label>
                <Input
                  placeholder="Buscar filme/série..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="mt-2"
                />
                <div className="mt-2 max-h-72 overflow-y-auto border rounded p-2 space-y-1">
                  {filteredMovies.map((m) => {
                    const checked = form.items.some((i) => i.id === m.id && i.type === "movie");
                    return (
                      <label key={`m-${m.id}`} className="flex items-center gap-2 text-sm py-1 cursor-pointer hover:bg-muted/50 px-2 rounded">
                        <Checkbox checked={checked} onCheckedChange={() => toggleItem(m.id, "movie")} />
                        <Badge variant="secondary" className="text-xs">Filme</Badge>
                        <span className="truncate">{m.title}</span>
                      </label>
                    );
                  })}
                  {filteredSeries.map((s) => {
                    const checked = form.items.some((i) => i.id === s.id && i.type === "series");
                    return (
                      <label key={`s-${s.id}`} className="flex items-center gap-2 text-sm py-1 cursor-pointer hover:bg-muted/50 px-2 rounded">
                        <Checkbox checked={checked} onCheckedChange={() => toggleItem(s.id, "series")} />
                        <Badge variant="secondary" className="text-xs">Série</Badge>
                        <span className="truncate">{s.title}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={save}>{editing ? "Salvar" : "Criar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CollectionsManager;
