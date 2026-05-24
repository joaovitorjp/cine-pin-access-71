import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useHistory } from "@/contexts/HistoryContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, LogOut, Heart, History, Pencil, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import ClientProfileEdit from "@/components/ClientProfileEdit";
import SecuritySettings from "@/components/SecuritySettings";
import AvatarPickerDialog from "@/components/AvatarPickerDialog";
import { toast } from "@/components/ui/use-toast";

const ClientInfo: React.FC = () => {
  const { clientName, logout, isAdmin, avatar, updateAvatar, user } = useAuth();
  const [pickerOpen, setPickerOpen] = useState(false);
  const { favoriteMovies, favoriteSeries, favoriteLiveTV } = useFavorites();
  const { history } = useHistory();

  const totalFavorites = favoriteMovies.length + favoriteSeries.length + favoriteLiveTV.length;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Hero header */}
        <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/20 via-card to-card p-6 sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.25),transparent_60%)] pointer-events-none" />
          <div className="relative flex flex-col items-center text-center gap-4">
            <div className="relative">
              <div className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-primary/30 bg-primary/10 flex items-center justify-center shadow-xl">
                {avatar ? (
                  <img src={avatar} alt={clientName} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-14 h-14 text-primary" />
                )}
              </div>
              {!isAdmin && (
                <button
                  onClick={() => setPickerOpen(true)}
                  className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                  aria-label="Trocar avatar"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{clientName}</h1>
              {user?.email && (
                <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-4">
          <Link to="/favorites" className="group">
            <Card className="bg-card border-border hover:border-primary/50 transition-colors h-full">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-red-500/15 flex items-center justify-center shrink-0">
                  <Heart className="w-5 h-5 text-red-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">Favoritos</p>
                  <p className="font-semibold text-lg leading-tight">{totalFavorites}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </CardContent>
            </Card>
          </Link>
          <Link to="/history" className="group">
            <Card className="bg-card border-border hover:border-primary/50 transition-colors h-full">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-blue-500/15 flex items-center justify-center shrink-0">
                  <History className="w-5 h-5 text-blue-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">Histórico</p>
                  <p className="font-semibold text-lg leading-tight">{history.length}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </CardContent>
            </Card>
          </Link>
        </div>

        {!isAdmin && <ClientProfileEdit />}

        <SecuritySettings />

        <Card className="bg-card border-border">
          <CardContent className="p-5 space-y-2 text-sm text-muted-foreground">
            <p>• Apenas um dispositivo pode estar logado por vez.</p>
            <p>• Ao entrar em outro dispositivo, este será desconectado.</p>
            <p>• Mantenha sua senha segura e não compartilhe.</p>
          </CardContent>
        </Card>

        <Button
          onClick={logout}
          variant="outline"
          className="w-full h-12 rounded-xl gap-2 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sair da Conta
        </Button>
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
