import React, { useEffect, useMemo, useState } from "react";
import {
  ContentRequest,
  RequestStatus,
  STATUS_LABEL,
  deleteRequest,
  linkRequestContent,
  subscribeRequests,
  updateRequestStatus,
} from "@/services/requestsService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Trash2, Inbox, Link2, ExternalLink, Plus } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { addMovie, getAllMovies } from "@/services/movieService";
import { addSeries, getAllSeries } from "@/services/seriesService";
import { Movie, Series } from "@/types";
import { Link } from "react-router-dom";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const STATUS_COLOR: Record<RequestStatus, string> = {
  received: "bg-blue-500/15 text-blue-500 border-blue-500/30",
  in_review: "bg-yellow-500/15 text-yellow-500 border-yellow-500/30",
  added: "bg-green-500/15 text-green-500 border-green-500/30",
};

const RequestsManager: React.FC = () => {
  const [items, setItems] = useState<ContentRequest[]>([]);
  const [filter, setFilter] = useState<"all" | RequestStatus>("all");
  const [loading, setLoading] = useState(true);

  const [movies, setMovies] = useState<Movie[]>([]);
  const [series, setSeries] = useState<Series[]>([]);
  const [linkPick, setLinkPick] = useState<Record<string, string>>({}); // requestId -> "movie:id" | "series:id"

  const [addOpen, setAddOpen] = useState(false);
  const [addRequest, setAddRequest] = useState<ContentRequest | null>(null);
  const [addKind, setAddKind] = useState<"movie" | "series">("movie");
  const [addForm, setAddForm] = useState({
    title: "", imageUrl: "", videoUrl: "", description: "", year: "", genre: "", rating: "",
  });
  const [addLoading, setAddLoading] = useState(false);

  useEffect(() => {
    const unsub = subscribeRequests((list) => {
      setItems(list);
      setLoading(false);
    });
    getAllMovies().then(setMovies).catch(() => {});
    getAllSeries().then(setSeries).catch(() => {});
    return unsub;
  }, []);

  const filtered = useMemo(
    () => (filter === "all" ? items : items.filter((i) => i.status === filter)),
    [items, filter]
  );

  const counts = useMemo(() => ({
    all: items.length,
    received: items.filter((i) => i.status === "received").length,
    in_review: items.filter((i) => i.status === "in_review").length,
    added: items.filter((i) => i.status === "added").length,
  }), [items]);

  const changeStatus = async (id: string, status: RequestStatus) => {
    try {
      await updateRequestStatus(id, status);
      toast({ title: "Status atualizado" });
    } catch {
      toast({ title: "Erro ao atualizar", variant: "destructive" });
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Excluir esta solicitação?")) return;
    try {
      await deleteRequest(id);
      toast({ title: "Solicitação removida" });
    } catch {
      toast({ title: "Erro ao remover", variant: "destructive" });
    }
  };

  const onLink = async (r: ContentRequest) => {
    const pick = linkPick[r.id];
    if (!pick) {
      toast({ title: "Selecione um conteúdo", variant: "destructive" });
      return;
    }
    const [linkedContentType, linkedContentId] = pick.split(":") as ["movie" | "series", string];
    const linkedContentTitle =
      linkedContentType === "movie"
        ? movies.find((m) => m.id === linkedContentId)?.title || r.title
        : series.find((s) => s.id === linkedContentId)?.title || r.title;
    try {
      await linkRequestContent(r.id, { linkedContentId, linkedContentType, linkedContentTitle });
      toast({ title: "Conteúdo vinculado e usuário notificado" });
    } catch {
      toast({ title: "Erro ao vincular", variant: "destructive" });
    }
  };

  const openAddDialog = (r: ContentRequest) => {
    setAddRequest(r);
    setAddKind(r.type === "series" ? "series" : "movie");
    setAddForm({
      title: r.title || "",
      imageUrl: "",
      videoUrl: "",
      description: r.notes || "",
      year: "",
      genre: r.category || "",
      rating: "",
    });
    setAddOpen(true);
  };

  const onCreateAndLink = async () => {
    if (!addRequest) return;
    const { title, imageUrl, videoUrl, description, year, genre, rating } = addForm;
    if (!title || !imageUrl || !videoUrl || !description) {
      toast({ title: "Preencha título, imagem, vídeo e descrição", variant: "destructive" });
      return;
    }
    setAddLoading(true);
    try {
      let newId = "";
      let newTitle = title;
      if (addKind === "series") {
        const created = await addSeries({ title, imageUrl, description, year, genre, rating, seasons: [] } as any);
        newId = created.id;
        newTitle = created.title;
        setSeries((prev) => [...prev, created]);
      } else {
        const created = await addMovie({ title, imageUrl, videoUrl, description, year, genre, rating } as any);
        newId = created.id;
        newTitle = created.title;
        setMovies((prev) => [...prev, created]);
      }
      await linkRequestContent(addRequest.id, {
        linkedContentId: newId,
        linkedContentType: addKind,
        linkedContentTitle: newTitle,
      });
      toast({ title: "Conteúdo adicionado e usuário notificado" });
      setAddOpen(false);
      setAddRequest(null);
    } catch {
      toast({ title: "Erro ao adicionar", variant: "destructive" });
    } finally {
      setAddLoading(false);
    }
  };



  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-xl md:text-2xl font-semibold flex items-center gap-2">
          <Inbox className="w-5 h-5" /> Solicitações ({counts.all})
        </h2>
        <div className="flex gap-2 flex-wrap">
          {(["all", "received", "in_review", "added"] as const).map((s) => (
            <Button
              key={s}
              size="sm"
              variant={filter === s ? "default" : "outline"}
              onClick={() => setFilter(s)}
            >
              {s === "all" ? "Todas" : STATUS_LABEL[s]} ({counts[s]})
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-muted-foreground animate-pulse">Carregando...</div>
      ) : filtered.length === 0 ? (
        <div className="text-muted-foreground bg-card p-6 rounded-md text-center border border-border">
          Nenhuma solicitação encontrada.
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((r) => (
            <div
              key={r.id}
              className="bg-card border border-border rounded-md p-3 flex flex-col sm:flex-row sm:items-center gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold truncate">{r.title}</span>
                  <Badge variant="outline" className={STATUS_COLOR[r.status]}>
                    {STATUS_LABEL[r.status]}
                  </Badge>
                  <Badge variant="secondary">{r.type === "movie" ? "Filme" : r.type === "series" ? "Série" : "Qualquer"}</Badge>
                  <Badge variant="secondary">{r.category}</Badge>
                </div>
                {r.notes && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{r.notes}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Por {r.requesterName || "Anônimo"} • {new Date(r.createdAt).toLocaleString("pt-BR")}
                </p>
                {r.linkedContentId && r.linkedContentType && (
                  <Link
                    to={`/${r.linkedContentType}/${r.linkedContentId}`}
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Vinculado: {r.linkedContentTitle}
                  </Link>
                )}
                <div className="mt-2 flex flex-col sm:flex-row gap-2 sm:items-center">
                  <Select
                    value={linkPick[r.id] || ""}
                    onValueChange={(v) => setLinkPick((p) => ({ ...p, [r.id]: v }))}
                  >
                    <SelectTrigger className="w-full sm:w-[260px] h-8 text-xs">
                      <SelectValue placeholder="Vincular ao conteúdo do catálogo..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-72">
                      {movies.length > 0 && (
                        <>
                          <div className="px-2 py-1 text-[10px] uppercase text-muted-foreground">Filmes</div>
                          {movies.map((m) => (
                            <SelectItem key={`m-${m.id}`} value={`movie:${m.id}`}>
                              🎬 {m.title}
                            </SelectItem>
                          ))}
                        </>
                      )}
                      {series.length > 0 && (
                        <>
                          <div className="px-2 py-1 text-[10px] uppercase text-muted-foreground">Séries</div>
                          {series.map((s) => (
                            <SelectItem key={`s-${s.id}`} value={`series:${s.id}`}>
                              📺 {s.title}
                            </SelectItem>
                          ))}
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  <Button size="sm" variant="secondary" onClick={() => onLink(r)} className="h-8">
                    <Link2 className="w-3 h-3 mr-1" /> Vincular e notificar
                  </Button>
                  <Button size="sm" onClick={() => openAddDialog(r)} className="h-8">
                    <Plus className="w-3 h-3 mr-1" /> Adicionar ao catálogo
                  </Button>
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <Select value={r.status} onValueChange={(v) => changeStatus(r.id, v as RequestStatus)}>
                  <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="received">{STATUS_LABEL.received}</SelectItem>
                    <SelectItem value="in_review">{STATUS_LABEL.in_review}</SelectItem>
                    <SelectItem value="added">{STATUS_LABEL.added}</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="destructive" size="icon" onClick={() => onDelete(r.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RequestsManager;
