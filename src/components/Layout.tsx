
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Lock, LogOut, Home, Settings } from "lucide-react";
import AdminModal from "@/components/AdminModal";
import { useIsMobile } from "@/hooks/use-mobile";
import BottomNavigation from "@/components/BottomNavigation";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showAdminModal, setShowAdminModal] = React.useState(false);
  const isMobile = useIsMobile();

  const handleSuccessfulAdminLogin = () => {
    navigate("/admin");
  };

  const isPlayerPage = location.pathname.includes('/player/');

  // Se não estiver logado, usar layout especial para tela de login (sem scroll)
  if (!isLoggedIn) {
    return (
      <div className="h-screen w-screen overflow-hidden flex flex-col fixed inset-0">
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    );
  }

  // Após o login, usar layout normal com scroll
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      {!isPlayerPage && (
        <header className="bg-netflix-black py-4 px-6 border-b border-gray-800 sticky top-0 z-10">
          <div className="container mx-auto">
            <div className="flex justify-between items-center">
              <Link to="/" className="flex-shrink-0">
                <h1 className="text-netflix-red text-xl sm:text-2xl font-bold">CineAdrian</h1>
              </Link>
              
              {isLoggedIn && (
                <nav className="flex items-center gap-2">
                  <Link to="/">
                    <Button 
                      variant="ghost" 
                      size={isMobile ? "icon" : "default"}
                      className={`${location.pathname === "/" ? "text-white" : "text-gray-400 hover:text-white"}`}
                    >
                      <Home className="w-5 h-5" />
                      {!isMobile && <span className="ml-2">Início</span>}
                    </Button>
                  </Link>
                  
                  {isAdmin && (
                    <Link to="/admin">
                      <Button 
                        variant="ghost" 
                        size={isMobile ? "icon" : "default"}
                        className={`${location.pathname === "/admin" ? "text-white" : "text-gray-400 hover:text-white"}`}
                      >
                        <Settings className="w-5 h-5" />
                        {!isMobile && <span className="ml-2">Admin</span>}
                      </Button>
                    </Link>
                  )}
                  
                  <Button 
                    variant="ghost" 
                    onClick={logout} 
                    size={isMobile ? "icon" : "default"}
                    className="text-gray-400 hover:text-white"
                  >
                    <LogOut className="w-5 h-5" />
                    {!isMobile && <span className="ml-2">Sair</span>}
                  </Button>
                </nav>
              )}
            </div>
          </div>
        </header>
      )}
      
      {/* Main content */}
      <main className="flex-grow pb-16">
        {children}
      </main>
      
      {/* Bottom Navigation */}
      {isLoggedIn && <BottomNavigation />}
      
      {/* Footer */}
      <footer className={`bg-netflix-black py-4 px-6 border-t border-gray-800 relative ${isPlayerPage ? 'hidden' : ''}`}>
        <div className="container mx-auto flex justify-between items-center">
          <p className="text-netflix-gray text-sm">
            &copy; {new Date().getFullYear()} CineAdrian. Todos os direitos reservados.
          </p>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-netflix-gray hover:text-white"
            onClick={() => setShowAdminModal(true)}
          >
            <Lock className="w-5 h-5" />
          </Button>
        </div>
      </footer>
      
      {/* Admin login modal */}
      <AdminModal 
        open={showAdminModal} 
        onOpenChange={setShowAdminModal} 
        onSuccessfulLogin={handleSuccessfulAdminLogin}
      />
    </div>
  );
};

export default Layout;
