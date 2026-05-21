import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Monitor, Tablet, LogOut, ShieldAlert } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  DeviceSession, getDevices, revokeAllSessions, revokeDevice, findPinIdByCode,
} from "@/services/devicesService";
import { toast } from "@/components/ui/use-toast";

const SecuritySettings: React.FC = () => {
  const { isAdmin } = useAuth();
  const [devices, setDevices] = useState<DeviceSession[]>([]);
  const [pinId, setPinId] = useState<string | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async (pid: string) => {
    setLoading(true);
    try {
      const list = await getDevices(pid);
      setDevices(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      const stored = localStorage.getItem("authState");
      if (!stored) return;
      try {
        const { pinCode, sessionId } = JSON.parse(stored);
        if (!pinCode) { setLoading(false); return; }
        setCurrentSessionId(sessionId || null);
        const id = await findPinIdByCode(pinCode);
        if (id) {
          setPinId(id);
          await refresh(id);
        } else {
          setLoading(false);
        }
      } catch {
        setLoading(false);
      }
    })();
  }, []);

  const revokeOne = async (deviceId: string) => {
    if (!pinId) return;
    if (!confirm("Remover este dispositivo?")) return;
    await revokeDevice(pinId, deviceId);
    await refresh(pinId);
    toast({ title: "Dispositivo removido" });
  };

  const revokeAll = async () => {
    if (!pinId) return;
    if (!confirm("Encerrar todas as sessões? Você precisará entrar novamente.")) return;
    await revokeAllSessions(pinId);
    toast({ title: "Sessões encerradas", description: "Todos os dispositivos serão desconectados." });
    await refresh(pinId);
  };

  const DeviceIcon = (t: DeviceSession["deviceType"]) =>
    t === "mobile" ? Smartphone : t === "tablet" ? Tablet : Monitor;

  if (isAdmin) return null;

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5" /> Histórico de Dispositivos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Visualize os dispositivos conectados à sua conta. Encerre sessões suspeitas a qualquer momento.
        </p>

        {loading ? (
          <div className="text-muted-foreground animate-pulse">Carregando dispositivos...</div>
        ) : devices.length === 0 ? (
          <div className="text-muted-foreground text-sm">Nenhum dispositivo registrado ainda.</div>
        ) : (
          <div className="space-y-2">
            {devices.map((d) => {
              const Icon = DeviceIcon(d.deviceType);
              const isCurrent = d.sessionId === currentSessionId;
              return (
                <div
                  key={d.id}
                  className="flex items-center gap-3 p-3 rounded-md bg-muted/50"
                >
                  <Icon className="w-5 h-5 text-primary" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{d.platform}</span>
                      <Badge variant="outline" className="text-xs">{d.deviceType}</Badge>
                      {isCurrent && <Badge className="text-xs">Este dispositivo</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      Último acesso: {new Date(d.lastSeen).toLocaleString("pt-BR")}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => revokeOne(d.id)}
                    className="text-destructive"
                  >
                    Remover
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        <Button
          variant="destructive"
          onClick={revokeAll}
          className="w-full gap-2"
          disabled={!pinId}
        >
          <LogOut className="w-4 h-4" /> Encerrar todas as sessões
        </Button>
        <p className="text-xs text-muted-foreground">
          Esta ação desconectará todos os dispositivos, incluindo este. Será necessário fazer login novamente.
        </p>
      </CardContent>
    </Card>
  );
};

export default SecuritySettings;
