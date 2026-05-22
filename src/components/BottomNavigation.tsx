
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Film, Tv, Radio, User, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const BottomNavigation: React.FC = () => {
  const location = useLocation();
  const { isAdmin } = useAuth();
  const isMoviesActive = location.pathname === "/" || location.pathname.startsWith("/movie");
  const isSeriesActive = location.pathname.startsWith("/series");
  const isLiveTVActive = location.pathname.startsWith("/livetv");
  const isInfoActive = location.pathname === "/info";
  const isAdminActive = location.pathname === "/admin" || location.pathname.startsWith("/admin");



  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-border z-50">
      <div className="container mx-auto flex justify-center">
        <div className={`flex w-full ${isAdmin ? 'max-w-md' : 'max-w-lg'}`}>
          <Link to="/" className="flex-1">
            <div 
              className={`flex flex-col items-center py-3 transition-all duration-300 ${
                isMoviesActive 
                  ? "text-foreground translate-y-[-4px]" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Film className={`w-6 h-6 transition-transform duration-300 ${
                isMoviesActive ? 'scale-110' : ''
              }`} />
              <span className={`text-xs mt-1 transition-all duration-300 ${
                isMoviesActive ? 'opacity-100' : 'opacity-70'
              }`}>
                Filmes
              </span>
            </div>
          </Link>
          
          <Link to="/series" className="flex-1">
            <div 
              className={`flex flex-col items-center py-3 transition-all duration-300 ${
                isSeriesActive 
                  ? "text-foreground translate-y-[-4px]" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Tv className={`w-6 h-6 transition-transform duration-300 ${
                isSeriesActive ? 'scale-110' : ''
              }`} />
              <span className={`text-xs mt-1 transition-all duration-300 ${
                isSeriesActive ? 'opacity-100' : 'opacity-70'
              }`}>
                Séries
              </span>
            </div>
          </Link>

          <Link to="/livetv" className="flex-1">
            <div 
              className={`flex flex-col items-center py-3 transition-all duration-300 ${
                isLiveTVActive 
                  ? "text-foreground translate-y-[-4px]" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Radio className={`w-6 h-6 transition-transform duration-300 ${
                isLiveTVActive ? 'scale-110' : ''
              }`} />
              <span className={`text-xs mt-1 transition-all duration-300 ${
                isLiveTVActive ? 'opacity-100' : 'opacity-70'
              }`}>
                TV Ao Vivo
              </span>
            </div>
          </Link>

          {isAdmin ? (
            <Link to="/admin" className="flex-1">
              <div
                className={`flex flex-col items-center py-3 transition-all duration-300 ${
                  isAdminActive
                    ? "text-foreground translate-y-[-4px]"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <LayoutDashboard className={`w-6 h-6 transition-transform duration-300 ${
                  isAdminActive ? 'scale-110' : ''
                }`} />
                <span className={`text-xs mt-1 transition-all duration-300 ${
                  isAdminActive ? 'opacity-100' : 'opacity-70'
                }`}>
                  Painel
                </span>
              </div>
            </Link>
          ) : (
            <Link to="/info" className="flex-1">
              <div
                className={`flex flex-col items-center py-3 transition-all duration-300 ${
                  isInfoActive
                    ? "text-foreground translate-y-[-4px]"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <User className={`w-6 h-6 transition-transform duration-300 ${
                  isInfoActive ? 'scale-110' : ''
                }`} />
                <span className={`text-xs mt-1 transition-all duration-300 ${
                  isInfoActive ? 'opacity-100' : 'opacity-70'
                }`}>
                  Info
                </span>
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default BottomNavigation;
