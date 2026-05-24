import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserCog } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const ClientProfileEdit: React.FC = () => {
  const { clientName, updateDisplayName, user } = useAuth();
  const [name, setName] = useState(clientName || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateDisplayName(name);
      toast({ title: "Perfil atualizado" });
    } catch (err) {
      toast({
        title: "Erro ao atualizar",
        description: err instanceof Error ? err.message : "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCog className="w-5 h-5" /> Editar Perfil
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="profile-name">Nome</Label>
            <Input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user?.email || ""} disabled />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ClientProfileEdit;
