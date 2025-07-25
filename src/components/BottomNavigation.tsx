
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Film, Tv, Radio, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const BottomNavigation: React.FC = () => {
  const location = useLocation();
  const { isAdmin } = useAuth();
  const isMoviesActive = location.pathname === "/" || location.pathname.startsWith("/movie");
  const isSeriesActive = location.pathname === "/series" || location.pathname.startsWith("/series");
  const isLiveTVActive = location.pathname === "/livetv" || location.pathname.startsWith("/livetv");
  const isInfoActive = location.pathname === "/info";
  const isPlayerPage = location.pathname.includes('/player/');
  
  if (isPlayerPage) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-lg border-t border-gray-800 z-50">
      <div className="container mx-auto flex justify-center">
        <div className={`flex w-full ${isAdmin ? 'max-w-md' : 'max-w-lg'}`}>
          <Link to="/" className="flex-1">
            <div 
              className={`flex flex-col items-center py-3 transition-all duration-300 ${
                isMoviesActive 
                  ? "text-white translate-y-[-4px]" 
                  : "text-gray-400 hover:text-gray-200"
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
                  ? "text-white translate-y-[-4px]" 
                  : "text-gray-400 hover:text-gray-200"
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
                  ? "text-white translate-y-[-4px]" 
                  : "text-gray-400 hover:text-gray-200"
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

          {!isAdmin && (
            <Link to="/info" className="flex-1">
              <div 
                className={`flex flex-col items-center py-3 transition-all duration-300 ${
                  isInfoActive 
                    ? "text-white translate-y-[-4px]" 
                    : "text-gray-400 hover:text-gray-200"
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
