import React, { useEffect, useMemo, useState } from "react";
import { Bell, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAuth } from "@/contexts/AuthContext";
import {
  ContentRequest,
  STATUS_LABEL,
  subscribeRequestsByPin,
} from "@/services/requestsService";
import { toast } from "@/components/ui/use-toast";

const SEEN_KEY = "cineflex:seenAddedRequests";
const NOTIFIED_KEY = "cineflex:notifiedAddedRequests";

const readSet = (key: string): Set<string> => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
};
const writeSet = (key: string, s: Set<string>) => {
  try {
    localStorage.setItem(key, JSON.stringify(Array.from(s)));
  } catch { /* ignore */ }
};

const UserNotificationsBell: React.FC = () => {
  const { isLoggedIn, isAdmin } = useAuth();
  const [requests, setRequests] = useState<ContentRequest[]>([]);
  const [pinCode, setPinCode] = useState<string | null>(null);
  const [seen, setSeen] = useState<Set<string>>(() => readSet(SEEN_KEY));
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isLoggedIn || isAdmin) return;
    try {
      const stored = localStorage.getItem("authState");
      if (!stored) return;
      const { pinCode } = JSON.parse(stored);
      if (pinCode) setPinCode(pinCode);
    } catch { /* ignore */ }
  }, [isLoggedIn, isAdmin]);

  useEffect(() => {
    if (!pinCode) return;
    const unsub = subscribeRequestsByPin(pinCode, (list) => {
      setRequests(list);

      // toast notify newly added ones we haven't notified yet
      const added = list.filter((r) => r.status === "added");
      const notified = readSet(NOTIFIED_KEY);
      const toNotify = added.filter((r) => !notified.has(r.id));
      if (toNotify.length) {
        toNotify.forEach((r) => {
          toast({
            title: "Sua solicitação foi atendida! 🎉",
            description: `"${r.title}" foi adicionado ao catálogo.`,
          });
          notified.add(r.id);
        });
        writeSet(NOTIFIED_KEY, notified);
      }
    });
    return unsub;
  }, [pinCode]);

  const unread = useMemo(
    () => requests.filter((r) => r.status === "added" && !seen.has(r.id)),
    [requests, seen]
  );

  const markAllSeen = () => {
    const next = new Set(seen);
    requests.forEach((r) => next.add(r.id));
    setSeen(next);
    writeSet(SEEN_KEY, next);
  };

  if (!isLoggedIn || isAdmin) return null;

  return (
    <Popover
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v) markAllSeen();
      }}
    >
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative shrink-0" aria-label="Notificações">
          <Bell className="w-5 h-5" />
          {unread.length > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
              {unread.length > 9 ? "9+" : unread.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="p-3 border-b border-border">
          <p className="font-semibold text-sm">Notificações</p>
          <p className="text-xs text-muted-foreground">Atualizações das suas solicitações</p>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {requests.length === 0 ? (
            <p className="text-sm text-muted-foreground p-4 text-center">
              Você ainda não fez nenhuma solicitação.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {requests.map((r) => (
                <li key={r.id} className="p-3 text-sm">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium truncate">{r.title}</span>
                    <Badge
                      variant="outline"
                      className={
                        r.status === "added"
                          ? "bg-green-500/15 text-green-500 border-green-500/30"
                          : r.status === "in_review"
                          ? "bg-yellow-500/15 text-yellow-500 border-yellow-500/30"
                          : "bg-blue-500/15 text-blue-500 border-blue-500/30"
                      }
                    >
                      {STATUS_LABEL[r.status]}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(r.updatedAt).toLocaleString("pt-BR")}
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

export default UserNotificationsBell;
