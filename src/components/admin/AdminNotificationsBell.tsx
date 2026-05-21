import React, { useEffect, useMemo, useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ContentRequest,
  subscribeRequests,
} from "@/services/requestsService";
import { toast } from "@/components/ui/use-toast";

interface Props {
  onOpenRequests?: () => void;
}

const SEEN_KEY = "cineflex:admin:seenReceivedRequests";

const readSet = (): Set<string> => {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
};

const AdminNotificationsBell: React.FC<Props> = ({ onOpenRequests }) => {
  const [requests, setRequests] = useState<ContentRequest[]>([]);
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState<Set<string>>(() => readSet());
  const [firstLoad, setFirstLoad] = useState(true);

  useEffect(() => {
    const unsub = subscribeRequests((list) => {
      setRequests(list);
      // Toast for new received items (only after first load)
      const received = list.filter((r) => r.status === "received");
      if (!firstLoad) {
        const knownIds = new Set(requests.map((r) => r.id));
        const fresh = received.filter((r) => !knownIds.has(r.id));
        fresh.forEach((r) => {
          toast({
            title: "Nova solicitação recebida",
            description: `${r.title} — ${r.requesterName || "Anônimo"}`,
          });
        });
      }
      setFirstLoad(false);
    });
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pending = useMemo(
    () => requests.filter((r) => r.status === "received"),
    [requests]
  );

  const unreadCount = useMemo(
    () => pending.filter((r) => !seen.has(r.id)).length,
    [pending, seen]
  );

  const markAllSeen = () => {
    const next = new Set(seen);
    pending.forEach((p) => next.add(p.id));
    setSeen(next);
    try { localStorage.setItem(SEEN_KEY, JSON.stringify(Array.from(next))); } catch { /* ignore */ }
  };

  return (
    <Popover
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v) markAllSeen();
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-netflix-gray hover:text-white"
          aria-label="Notificações"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="p-3 border-b border-border flex items-center justify-between">
          <div>
            <p className="font-semibold text-sm">Solicitações pendentes</p>
            <p className="text-xs text-muted-foreground">{pending.length} aguardando atendimento</p>
          </div>
          {onOpenRequests && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setOpen(false);
                onOpenRequests();
              }}
            >
              Ver todas
            </Button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {pending.length === 0 ? (
            <p className="text-sm text-muted-foreground p-4 text-center">
              Nenhuma solicitação pendente.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {pending.slice(0, 10).map((r) => (
                <li key={r.id} className="p-3 text-sm">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium truncate">{r.title}</span>
                    <Badge variant="secondary" className="text-[10px]">
                      {r.type === "movie" ? "Filme" : r.type === "series" ? "Série" : "Qualquer"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Por {r.requesterName || "Anônimo"} • {new Date(r.createdAt).toLocaleString("pt-BR")}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default AdminNotificationsBell;
