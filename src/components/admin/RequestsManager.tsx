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
import { Trash2, Inbox, Link2, ExternalLink } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { getAllMovies } from "@/services/movieService";
import { getAllSeries } from "@/services/seriesService";
import { Movie, Series } from "@/types";
import { Link } from "react-router-dom";

const STATUS_COLOR: Record<RequestStatus, string> = {
  received: "bg-blue-500/15 text-blue-500 border-blue-500/30",
  in_review: "bg-yellow-500/15 text-yellow-500 border-yellow-500/30",
  added: "bg-green-500/15 text-green-500 border-green-500/30",
};

const RequestsManager: React.FC = () => {
  const [items, setItems] = useState<ContentRequest[]>([]);
  const [filter, setFilter] = useState<"all" | RequestStatus>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeRequests((list) => {
      setItems(list);
      setLoading(false);
    });
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
