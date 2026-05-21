
import React, { createContext, useContext, useState, useEffect } from "react";
import { validatePin, validateSession } from "@/services/pinService";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { registerDevice, findPinIdByCode, touchDevice } from "@/services/devicesService";

interface AuthContextType {
  isLoggedIn: boolean;
  isAdmin: boolean;
  loading: boolean;
  clientName: string;
  daysRemaining: number;
  adminUsername: string;
  loginWithPin: (pin: string) => Promise<boolean>;
  loginAsAdmin: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  isAdmin: false,
  loading: true,
  clientName: "",
  daysRemaining: 0,
  adminUsername: "",
  loginWithPin: async () => false,
  loginAsAdmin: async () => false,
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [clientName, setClientName] = useState<string>("");
  const [daysRemaining, setDaysRemaining] = useState<number>(0);
  const [adminUsername, setAdminUsername] = useState<string>("");

  // Check local storage for auth state on mount and validate session
  useEffect(() => {
    const checkAuthState = async () => {
      const storedAuthState = localStorage.getItem("authState");
      if (storedAuthState) {
        const { isLoggedIn, isAdmin, expiry, clientName: storedClientName, pinCode, sessionId, adminUsername: storedAdminUsername } = JSON.parse(storedAuthState);
        if (new Date(expiry) > new Date()) {
          // For PIN users, validate session to ensure single device login
          if (!isAdmin && pinCode && sessionId) {
            const sessionValid = await validateSession(pinCode, sessionId);
            if (sessionValid) {
              setIsLoggedIn(isLoggedIn);
              setIsAdmin(isAdmin);
              setClientName(storedClientName || "");
              
              // Calculate days remaining
              const expiryDate = new Date(expiry);
              const currentDate = new Date();
              const diffTime = expiryDate.getTime() - currentDate.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              setDaysRemaining(Math.max(0, diffDays));
            } else {
              // Session invalid, logout
              localStorage.removeItem("authState");
              toast({
                title: "Sessão expirada",
                description: "Este PIN está sendo usado em outro dispositivo.",
                variant: "destructive",
              });
            }
          } else {
            // Admin login
            setIsLoggedIn(isLoggedIn);
            setIsAdmin(isAdmin);
            setClientName(storedClientName || "");
            setAdminUsername(storedAdminUsername || "");
          }
        } else {
          // Auth expired
          localStorage.removeItem("authState");
        }
      }
      setLoading(false);
    };

    checkAuthState();
    
    // Check session validity every 30 seconds for PIN users
    const interval = setInterval(async () => {
      const storedAuthState = localStorage.getItem("authState");
      if (storedAuthState) {
        const { isAdmin, pinCode, sessionId } = JSON.parse(storedAuthState);
        if (!isAdmin && pinCode && sessionId) {
          const sessionValid = await validateSession(pinCode, sessionId);
          if (!sessionValid) {
            localStorage.removeItem("authState");
            setIsLoggedIn(false);
            setIsAdmin(false);
            setClientName("");
            setDaysRemaining(0);
            toast({
              title: "Sessão expirada",
              description: "Este PIN está sendo usado em outro dispositivo.",
              variant: "destructive",
            });
          } else {
            // Keep device entry warm
            try {
              const pid = await findPinIdByCode(pinCode);
              if (pid) await touchDevice(pid, sessionId);
            } catch { /* ignore */ }
          }
            toast({
              title: "Sessão expirada",
              description: "Este PIN está sendo usado em outro dispositivo.",
              variant: "destructive",
            });
          }
        }
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Login with PIN
  const loginWithPin = async (pin: string): Promise<boolean> => {
    try {
      const pinData = await validatePin(pin);
      if (pinData) {
        const expiryDate = new Date(pinData.expiryDate);
        
        // Calculate days remaining
        const currentDate = new Date();
        const diffTime = expiryDate.getTime() - currentDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        // Save auth state with session info
        const authState = {
          isLoggedIn: true,
          isAdmin: false,
          expiry: expiryDate.toISOString(),
          clientName: pinData.clientName,
          pinCode: pin,
          sessionId: pinData.sessionId,
        };
        localStorage.setItem("authState", JSON.stringify(authState));

        // Register this device session (best-effort)
        try {
          const pid = await findPinIdByCode(pin);
          if (pid && pinData.sessionId) await registerDevice(pid, pinData.sessionId);
        } catch (e) { console.warn("device register failed", e); }

        
        setIsLoggedIn(true);
        setIsAdmin(false);
        setClientName(pinData.clientName);
        setDaysRemaining(Math.max(0, diffDays));
        
        toast({
          title: "Login efetuado com sucesso",
          description: `Bem-vindo, ${pinData.clientName}! Seu acesso expira em ${diffDays} dias.`,
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

  // Login as admin (validates username + password via Lovable Cloud)
  const loginAsAdmin = async (username: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc("validate_admin_credentials", {
        _username: username,
        _password: password,
      });

      if (error) {
        console.error("Erro ao validar credenciais admin:", error);
        toast({
          title: "Erro ao validar credenciais",
          description: "Não foi possível validar as credenciais. Tente novamente.",
          variant: "destructive",
        });
        return false;
      }

      if (data) {
        const validatedUsername = data as string;
        const expiry = new Date();
        expiry.setHours(expiry.getHours() + 24);

        const authState = {
          isLoggedIn: true,
          isAdmin: true,
          expiry: expiry.toISOString(),
          clientName: validatedUsername,
          adminUsername: validatedUsername,
        };
        localStorage.setItem("authState", JSON.stringify(authState));

        setIsLoggedIn(true);
        setIsAdmin(true);
        setClientName(validatedUsername);
        setAdminUsername(validatedUsername);

        toast({
          title: "Login admin efetuado com sucesso",
          description: `Bem-vindo, ${validatedUsername}.`,
        });

        return true;
      }

      toast({
        title: "Credenciais inválidas",
        description: "Usuário ou senha incorretos.",
        variant: "destructive",
      });
      return false;
    } catch (err) {
      console.error("Erro inesperado no login admin:", err);
      return false;
    }
  };

  // Logout
  const logout = () => {
    const wasAdmin = isAdmin;
    const redirectTo = wasAdmin ? "/admin-access" : "/";
    localStorage.removeItem("authState");
    toast({
      title: "Logout efetuado com sucesso",
      description: "Você foi desconectado.",
    });
    // Redireciona imediatamente para evitar piscar a tela do usuário
    window.location.replace(redirectTo);
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        isAdmin,
        loading,
        clientName,
        daysRemaining,
        adminUsername,
        loginWithPin,
        loginAsAdmin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
