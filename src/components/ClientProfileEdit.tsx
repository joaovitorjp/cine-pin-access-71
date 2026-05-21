import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserCog } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { getPinByCode, updatePinSelf } from "@/services/pinService";
import { useAuth } from "@/contexts/AuthContext";

const ClientProfileEdit: React.FC = () => {
  const { clientName } = useAuth();
  const [pinId, setPinId] = useState<string | null>(null);
  const [name, setName] = useState(clientName || "");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("authState");
    if (!stored) return;
    try {
      const { pinCode } = JSON.parse(stored);
      if (!pinCode) return;
      setPin(pinCode);
      getPinByCode(pinCode).then((p) => {
        if (p) {
          setPinId(p.id);
          setName(p.clientName || "");
        }
      });
    } catch {
      // ignore
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!pinId) return setError("Não foi possível identificar sua conta");
    if (!name.trim()) return setError("Informe seu nome");
    if (!pin.trim() || pin.trim().length < 4)
      return setError("O PIN deve ter pelo menos 4 caracteres");

    setLoading(true);
    try {
      const stored = localStorage.getItem("authState");
      const parsed = stored ? JSON.parse(stored) : {};
      const oldPin = parsed.pinCode as string | undefined;

      const { sessionId } = await updatePinSelf(pinId, { clientName: name, pin });

      // Keep the local session in sync so the user doesn't get logged out
      const updated = {
        ...parsed,
        clientName: name.trim(),
        pinCode: pin.trim(),
        ...(sessionId ? { sessionId } : {}),
      };
      localStorage.setItem("authState", JSON.stringify(updated));

      toast({
        title: "Perfil atualizado",
        description:
          oldPin !== pin.trim()
            ? "Seu nome e PIN foram atualizados. Use o novo PIN no próximo login."
            : "Seu nome foi atualizado.",
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao atualizar perfil";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCog className="w-5 h-5" />
          Editar Perfil
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="profile-name">Nome</Label>
            <Input
              id="profile-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-pin">PIN de Acesso</Label>
            <Input
              id="profile-pin"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Defina um novo PIN"
              minLength={4}
              className="font-mono"
              required
            />
            <p className="text-xs text-muted-foreground">
              Ao alterar o PIN, você precisará usá-lo no próximo login.
            </p>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" disabled={loading || !pinId} className="w-full">
            {loading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ClientProfileEdit;
