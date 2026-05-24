import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useHistory } from "@/contexts/HistoryContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Calendar, Clock, LogOut, Heart, History, Settings, Pencil } from "lucide-react";
import { Link } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";
import ClientProfileEdit from "@/components/ClientProfileEdit";
import SecuritySettings from "@/components/SecuritySettings";
import PlaybackPreferences from "@/components/PlaybackPreferences";
import AvatarPickerDialog from "@/components/AvatarPickerDialog";
import { toast } from "@/components/ui/use-toast";

const ClientInfo: React.FC = () => {
  const { clientName, daysRemaining, logout, isAdmin, avatar, updateAvatar } = useAuth();
  const [pickerOpen, setPickerOpen] = useState(false);
  const { favoriteMovies, favoriteSeries, favoriteLiveTV } = useFavorites();
  const { history } = useHistory();

  const totalFavorites = favoriteMovies.length + favoriteSeries.length + favoriteLiveTV.length;

  const formatDaysRemaining = (days: number) => {
    if (days === 0) return "Expira hoje";
    if (days === 1) return "1 dia restante";
    return `${days} dias restantes`;
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
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-14 h-14 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center shrink-0">
                    {avatar ? (
                      <img src={avatar} alt={clientName} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-7 h-7 text-primary" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-muted-foreground">Nome do Cliente</p>
                    <p className="font-semibold text-lg truncate">{clientName}</p>
                  </div>
                </div>
                {!isAdmin && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPickerOpen(true)}
                    className="gap-1 shrink-0"
                  >
                    <Pencil className="w-3 h-3" />
                    Avatar
                  </Button>
                )}
              </div>

              {isAdmin && (
                <>
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
                </>
              )}
            </div>

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

        {!isAdmin && <ClientProfileEdit />}

        <PlaybackPreferences />

        <SecuritySettings />

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Preferências e Dados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <Heart className="w-6 h-6 text-red-500" />
                <div>
                  <p className="font-semibold">Favoritos</p>
                  <p className="text-sm text-muted-foreground">{totalFavorites} itens salvos</p>
                </div>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link to="/favorites">Ver Favoritos</Link>
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <History className="w-6 h-6 text-blue-500" />
                <div>
                  <p className="font-semibold">Histórico</p>
                  <p className="text-sm text-muted-foreground">{history.length} itens assistidos</p>
                </div>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link to="/history">Ver Histórico</Link>
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <Settings className="w-6 h-6 text-green-500" />
                <div>
                  <p className="font-semibold">Tema</p>
                  <p className="text-sm text-muted-foreground">Personalizar aparência</p>
                </div>
              </div>
              <ThemeToggle />
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

      <AvatarPickerDialog
        open={pickerOpen}
        initialAvatar={avatar}
        title="Trocar avatar"
        description="Escolha uma nova imagem para o seu perfil."
        onOpenChange={setPickerOpen}
        onSelect={async (url) => {
          try {
            await updateAvatar(url);
            toast({ title: "Avatar atualizado" });
          } catch {
            toast({
              title: "Erro ao atualizar avatar",
              description: "Tente novamente.",
              variant: "destructive",
            });
            throw new Error("failed");
          }
        }}
      />
    </div>
  );
};

export default ClientInfo;