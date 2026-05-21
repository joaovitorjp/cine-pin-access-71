import React from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import BottomNavigation from "@/components/BottomNavigation";
import SearchBar from "@/components/SearchBar";
import HomeBannerCarousel from "@/components/HomeBannerCarousel";
import { useSearch } from "@/contexts/SearchContext";
import UserNotificationsBell from "@/components/UserNotificationsBell";

const LISTING_ROUTES = ["/", "/series", "/livetv"];

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn, isAdmin } = useAuth();
  const location = useLocation();
  const { setQuery } = useSearch();

  const isPlayerPage = location.pathname.includes("/player/");
  const isListing = LISTING_ROUTES.includes(location.pathname);

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
            <div className="flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <SearchBar onSearch={setQuery} />
              </div>
              {!isAdmin && <UserNotificationsBell />}
            </div>
            <HomeBannerCarousel />
          </div>
        </div>
      )}

      <main className="flex-grow pb-20">{children}</main>

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
    </div>
  );
};

export default Layout;
