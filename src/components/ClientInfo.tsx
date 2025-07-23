import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Calendar, Clock, LogOut } from "lucide-react";

const ClientInfo: React.FC = () => {
  const { clientName, daysRemaining, logout } = useAuth();

  const formatDaysRemaining = (days: number) => {
    if (days === 0) {
      return "Expira hoje";
    } else if (days === 1) {
      return "1 dia restante";
    } else {
      return `${days} dias restantes`;
    }
  };

  const getStatusColor = (days: number) => {
    if (days <= 3) return "text-red-500";
    if (days <= 7) return "text-yellow-500";
    return "text-green-500";
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center mb-8">Informações da Conta</h1>
        
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Dados do Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Nome do Cliente</p>
                    <p className="font-semibold text-lg">{clientName}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status da Assinatura</p>
                    <p className={`font-semibold text-lg ${getStatusColor(daysRemaining)}`}>
                      {formatDaysRemaining(daysRemaining)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Renovação Necessária</p>
                    <p className="font-semibold text-lg">
                      {daysRemaining <= 7 ? "Em breve" : "Não necessária"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {daysRemaining <= 7 && (
              <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-yellow-500" />
                  <p className="font-semibold text-yellow-700 dark:text-yellow-300">
                    Atenção: Acesso expirando em breve
                  </p>
                </div>
                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                  Entre em contato com o administrador para renovar seu acesso.
                </p>
              </div>
            )}

            <div className="pt-4 border-t">
              <Button 
                onClick={logout} 
                variant="outline" 
                className="w-full flex items-center gap-2 hover:bg-destructive hover:text-destructive-foreground"
              >
                <LogOut className="w-4 h-4" />
                Sair da Conta
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Informações Importantes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>• Apenas um dispositivo pode estar logado por vez com este PIN.</p>
              <p>• Se você fizer login em outro dispositivo, este será desconectado automaticamente.</p>
              <p>• Para renovar seu acesso, entre em contato com o administrador.</p>
              <p>• Mantenha seu PIN seguro e não compartilhe com outras pessoas.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientInfo;