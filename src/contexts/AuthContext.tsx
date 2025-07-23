
import React, { createContext, useContext, useState, useEffect } from "react";
import { validatePin } from "@/services/pinService";
import { toast } from "@/components/ui/use-toast";

interface AuthContextType {
  isLoggedIn: boolean;
  isAdmin: boolean;
  loading: boolean;
  loginWithPin: (pin: string) => Promise<boolean>;
  loginAsAdmin: (password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  isAdmin: false,
  loading: true,
  loginWithPin: async () => false,
  loginAsAdmin: () => false,
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Check local storage for auth state on mount
  useEffect(() => {
    const checkAuthState = () => {
      const storedAuthState = localStorage.getItem("authState");
      if (storedAuthState) {
        const { isLoggedIn, isAdmin, expiry } = JSON.parse(storedAuthState);
        if (new Date(expiry) > new Date()) {
          setIsLoggedIn(isLoggedIn);
          setIsAdmin(isAdmin);
        } else {
          // Auth expired
          localStorage.removeItem("authState");
        }
      }
      setLoading(false);
    };

    checkAuthState();
  }, []);

  // Login with PIN
  const loginWithPin = async (pin: string): Promise<boolean> => {
    try {
      const pinData = await validatePin(pin);
      if (pinData) {
        const expiryDate = new Date(pinData.expiryDate);
        
        // Save auth state
        const authState = {
          isLoggedIn: true,
          isAdmin: false,
          expiry: expiryDate.toISOString(),
        };
        localStorage.setItem("authState", JSON.stringify(authState));
        
        setIsLoggedIn(true);
        setIsAdmin(false);
        
        toast({
          title: "Login efetuado com sucesso",
          description: `Seu acesso expira em ${pinData.daysValid} dias.`,
        });
        
        return true;
      }
      
      toast({
        title: "PIN inválido",
        description: "O PIN fornecido é inválido ou expirou.",
        variant: "destructive",
      });
      
      return false;
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      
      toast({
        title: "Erro ao fazer login",
        description: "Ocorreu um erro ao tentar fazer login. Tente novamente.",
        variant: "destructive",
      });
      
      return false;
    }
  };

  // Login as admin
  const loginAsAdmin = (password: string): boolean => {
    if (password === "admin4455") {
      // Set expiry to 24 hours from now
      const expiry = new Date();
      expiry.setHours(expiry.getHours() + 24);
      
      // Save auth state
      const authState = {
        isLoggedIn: true,
        isAdmin: true,
        expiry: expiry.toISOString(),
      };
      localStorage.setItem("authState", JSON.stringify(authState));
      
      setIsLoggedIn(true);
      setIsAdmin(true);
      
      toast({
        title: "Login admin efetuado com sucesso",
        description: "Você está logado como administrador.",
      });
      
      return true;
    }
    
    toast({
      title: "Senha incorreta",
      description: "A senha fornecida está incorreta.",
      variant: "destructive",
    });
    
    return false;
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("authState");
    setIsLoggedIn(false);
    setIsAdmin(false);
    
    toast({
      title: "Logout efetuado com sucesso",
      description: "Você foi desconectado.",
    });
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        isAdmin,
        loading,
        loginWithPin,
        loginAsAdmin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
