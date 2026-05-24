import React from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import BottomNavigation from "@/components/BottomNavigation";
import SearchBar from "@/components/SearchBar";
import HomeBannerCarousel from "@/components/HomeBannerCarousel";
import { useSearch } from "@/contexts/SearchContext";
import UserNotificationsBell from "@/components/UserNotificationsBell";
import AvatarPickerDialog from "@/components/AvatarPickerDialog";
import { toast } from "@/components/ui/use-toast";
import logo from "@/assets/cineflex-logo.png";

const LISTING_ROUTES = ["/", "/series", "/livetv"];

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn, isAdmin, avatar, updateAvatar, loading } = useAuth();
  const location = useLocation();
  const { setQuery } = useSearch();

  const isPlayerPage = location.pathname.includes("/player/");
  const isListing = LISTING_ROUTES.includes(location.pathname);

  const needsAvatar = isLoggedIn && !isAdmin && !loading && !avatar;

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen w-full flex flex-col">
        <main className="flex-1">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {!isPlayerPage && isListing && (
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
          <div className="container mx-auto px-3 sm:px-4 py-3 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 shrink-0">
                <img src={logo} alt="CINE FLEX" className="h-8 w-auto" />
                <span className="font-bold text-lg text-white tracking-wide">CINE FLEX</span>
              </div>
              {!isAdmin && <UserNotificationsBell />}
            </div>
            <SearchBar onSearch={setQuery} />
          </div>
        </div>
      )}

      <main className="flex-grow pb-20">
        {!isPlayerPage && isListing && (
          <div className="container mx-auto px-3 sm:px-4 pt-3">
            <HomeBannerCarousel />
          </div>
        )}
        {children}
      </main>

      {isLoggedIn && <BottomNavigation />}

      {!isPlayerPage && (
        <footer className="bg-card py-3 px-6 border-t border-border">
          <div className="container mx-auto flex justify-center">
            <p className="text-muted-foreground text-xs">
              &copy; {new Date().getFullYear()} CINE FLEX. Todos os direitos reservados.
            </p>
          </div>
        </footer>
      )}

      <AvatarPickerDialog
        open={needsAvatar}
        dismissible={false}
        title="Escolha seu avatar"
        description="Selecione uma imagem para o seu perfil. Você poderá alterá-la depois nas configurações."
        onSelect={async (url) => {
          try {
            await updateAvatar(url);
            toast({ title: "Avatar definido", description: "Bem-vindo(a)!" });
          } catch {
            toast({
              title: "Erro ao salvar avatar",
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

export default Layout;
