import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, ShieldAlert } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const SecuritySettings: React.FC = () => {
  const { isAdmin, logout } = useAuth();
  if (isAdmin) return null;

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5" /> Segurança
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Sua conta permite um dispositivo conectado por vez. Ao entrar em outro lugar, esta sessão é
          encerrada automaticamente.
        </p>
        <Button variant="destructive" onClick={logout} className="w-full gap-2">
          <LogOut className="w-4 h-4" /> Sair desta conta
        </Button>
      </CardContent>
    </Card>
  );
};

export default SecuritySettings;
