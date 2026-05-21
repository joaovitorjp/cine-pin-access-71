import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import BottomNavigation from "@/components/BottomNavigation";
import SearchBar from "@/components/SearchBar";
import HomeBannerCarousel from "@/components/HomeBannerCarousel";
import { useSearch } from "@/contexts/SearchContext";
import { useKidsMode } from "@/contexts/KidsModeContext";

const LISTING_ROUTES = ["/", "/series", "/livetv"];
const KIDS_ALLOWED_PREFIXES = ["/kids", "/movie/", "/series/", "/player/"];

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { setQuery } = useSearch();
  const { isKidsMode } = useKidsMode();

  const isPlayerPage = location.pathname.includes("/player/");
  const isListing = LISTING_ROUTES.includes(location.pathname);
  const isKidsRoute = location.pathname.startsWith("/kids");

  // Lock navigation when Kids Mode is active
  useEffect(() => {
    if (!isLoggedIn || !isKidsMode) return;
    const allowed = KIDS_ALLOWED_PREFIXES.some((p) =>
      p.endsWith("/") ? location.pathname.startsWith(p) : location.pathname === p
    );
    if (!allowed) navigate("/kids", { replace: true });
  }, [isKidsMode, isLoggedIn, location.pathname, navigate]);

  // Login screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen w-full flex flex-col">
        <main className="flex-1">{children}</main>
      </div>
    );
  }

  // Kids Mode owns its own chrome — no top bar / bottom nav
  if (isKidsMode && isKidsRoute) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Sticky top: search + banners (only on listing pages) */}
      {!isPlayerPage && isListing && (
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
          <div className="container mx-auto px-3 sm:px-4 py-3 space-y-3">
            <SearchBar onSearch={setQuery} />
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
