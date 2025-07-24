
import React, { createContext, useContext, useState, useEffect } from "react";
import { validatePinSecure, validateAdminSecure, validateSessionSecure } from "@/services/supabaseAuthService";
import { toast } from "@/components/ui/use-toast";
import { encryptData, decryptData, getClientIdentifier, sanitizeInput } from "@/lib/security";

interface AuthContextType {
  isLoggedIn: boolean;
  isAdmin: boolean;
  loading: boolean;
  clientName: string;
  daysRemaining: number;
  loginWithPin: (pin: string) => Promise<boolean>;
  loginAsAdmin: (password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  isAdmin: false,
  loading: true,
  clientName: "",
  daysRemaining: 0,
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

  // Check local storage for auth state on mount and validate session
  useEffect(() => {
    const checkAuthState = async () => {
      const storedAuthState = localStorage.getItem("authState");
      if (storedAuthState) {
        try {
          // Try to decrypt and parse auth state
          const decryptedData = decryptData(storedAuthState);
          const authData = JSON.parse(decryptedData || storedAuthState);
          const { isLoggedIn, isAdmin, expiry, clientName: storedClientName, pinCode, sessionId } = authData;
          
          if (new Date(expiry) > new Date()) {
            // For PIN users, validate session to ensure single device login
            if (!isAdmin && pinCode && sessionId) {
              const sessionValid = await validateSessionSecure(pinCode, sessionId);
              if (sessionValid) {
                setIsLoggedIn(isLoggedIn);
                setIsAdmin(isAdmin);
                setClientName(sanitizeInput(storedClientName || ""));
                
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
              setClientName(sanitizeInput(storedClientName || ""));
            }
          } else {
            // Auth expired
            localStorage.removeItem("authState");
          }
        } catch (error) {
          console.error("Error parsing auth state:", error);
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
        try {
          const decryptedData = decryptData(storedAuthState);
          const authData = JSON.parse(decryptedData || storedAuthState);
          const { isAdmin, pinCode, sessionId } = authData;
          
          if (!isAdmin && pinCode && sessionId) {
            const sessionValid = await validateSessionSecure(pinCode, sessionId);
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
            }
          }
        } catch (error) {
          console.error("Error validating session:", error);
          localStorage.removeItem("authState");
          setIsLoggedIn(false);
          setIsAdmin(false);
          setClientName("");
          setDaysRemaining(0);
        }
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Login with PIN with enhanced security
  const loginWithPin = async (pin: string): Promise<boolean> => {
    try {
      const sanitizedPin = sanitizeInput(pin);
      const response = await validatePinSecure(sanitizedPin);
      
      if (response.success && response.pin_data) {
        const expiryDate = new Date(response.pin_data.expiry_date);
        
        // Calculate days remaining
        const currentDate = new Date();
        const diffTime = expiryDate.getTime() - currentDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        // Save encrypted auth state with session info
        const authState = {
          isLoggedIn: true,
          isAdmin: false,
          expiry: expiryDate.toISOString(),
          clientName: response.pin_data.client_name,
          pinCode: sanitizedPin,
          sessionId: response.pin_data.session_id,
        };
        
        const encryptedAuthState = encryptData(JSON.stringify(authState));
        localStorage.setItem("authState", encryptedAuthState);
        
        setIsLoggedIn(true);
        setIsAdmin(false);
        setClientName(sanitizeInput(response.pin_data.client_name));
        setDaysRemaining(Math.max(0, diffDays));
        
        toast({
          title: "Login efetuado com sucesso",
          description: `Bem-vindo, ${response.pin_data.client_name}! Seu acesso expira em ${diffDays} dias.`,
        });
        
        return true;
      } else {
        // Handle specific errors
        let errorMessage = "O PIN fornecido é inválido ou expirou.";
        if (response.error === 'rate_limited' && response.blocked_until) {
          const blockedUntil = new Date(response.blocked_until);
          const remainingTime = Math.ceil((blockedUntil.getTime() - Date.now()) / 60000);
          errorMessage = `Muitas tentativas. Tente novamente em ${remainingTime} minutos.`;
        }
        
        toast({
          title: "PIN inválido",
          description: errorMessage,
          variant: "destructive",
        });
        
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      console.error("Erro ao fazer login:", error);
      
      toast({
        title: "Erro ao fazer login",
        description: errorMessage,
        variant: "destructive",
      });
      
      return false;
    }
  };

  // Login as admin with enhanced security
  const loginAsAdmin = async (password: string): Promise<boolean> => {
    try {
      const sanitizedPassword = sanitizeInput(password);
      const response = await validateAdminSecure(sanitizedPassword);
      
      if (response.success) {
        // Set expiry (24 hours)
        const expiry = new Date();
        expiry.setHours(expiry.getHours() + 24);
        
        // Save encrypted auth state
        const authState = {
          isLoggedIn: true,
          isAdmin: true,
          expiry: expiry.toISOString(),
          clientName: "Administrador",
        };
        
        const encryptedAuthState = encryptData(JSON.stringify(authState));
        localStorage.setItem("authState", encryptedAuthState);
        
        setIsLoggedIn(true);
        setIsAdmin(true);
        setClientName("Administrador");
        
        toast({
          title: "Login admin efetuado com sucesso",
          description: "Você está logado como administrador.",
        });
        
        return true;
      } else {
        // Handle specific errors
        let errorMessage = "A senha fornecida está incorreta.";
        if (response.error === 'rate_limited' && response.remaining_time) {
          errorMessage = `Muitas tentativas. Tente novamente em ${response.remaining_time} minutos.`;
        }
        
        toast({
          title: "Login falhou",
          description: errorMessage,
          variant: "destructive",
        });
        
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      console.error("Erro ao fazer login admin:", error);
      
      toast({
        title: "Erro ao fazer login",
        description: errorMessage,
        variant: "destructive",
      });
      
      return false;
    }
  };

  // Logout
  const logout = () => {
    try {
      localStorage.removeItem("authState");
      setIsLoggedIn(false);
      setIsAdmin(false);
      setClientName("");
      setDaysRemaining(0);
      
      toast({
        title: "Logout efetuado com sucesso",
        description: "Você foi desconectado.",
      });
      
      // Força redirect para página inicial após logout
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    } catch (error) {
      console.error("Erro no logout:", error);
      // Mesmo com erro, força logout
      localStorage.removeItem("authState");
      setIsLoggedIn(false);
      setIsAdmin(false);
      setClientName("");
      setDaysRemaining(0);
      window.location.href = "/";
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        isAdmin,
        loading,
        clientName,
        daysRemaining,
        loginWithPin,
        loginAsAdmin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
