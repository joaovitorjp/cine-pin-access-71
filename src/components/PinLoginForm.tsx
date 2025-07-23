import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Lock } from "lucide-react";
import AdminModal from "@/components/AdminModal";
import { useNavigate } from "react-router-dom";

const PinLoginForm: React.FC = () => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [loadingMessage, setLoadingMessage] = useState(true);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const { loginWithPin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWelcomeMessage = async () => {
      try {
        const docRef = doc(db, "settings", "welcomeMessage");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().message) {
          setWelcomeMessage(docSnap.data().message);
        }
      } catch (error) {
        console.error("Erro ao buscar mensagem de boas-vindas:", error);
      } finally {
        setLoadingMessage(false);
      }
    };
    fetchWelcomeMessage();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin) {
      setError("Por favor, digite o PIN de acesso");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const success = await loginWithPin(pin);
      if (!success) {
        setError("PIN inválido ou expirado");
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      setError("Ocorreu um erro ao fazer login. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessfulAdminLogin = () => {
    navigate("/admin");
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex items-center justify-center p-4">
      <div className="w-full max-w-sm mx-auto">
        <div className="p-6 rounded-lg bg-netflix-dark">
          <h2 className="text-xl font-bold mb-3 text-center">CINE FLEX</h2>
          {!loadingMessage && welcomeMessage && (
            <p className="text-netflix-gray text-center text-sm mb-4 animate-fade-in">
              {welcomeMessage}
            </p>
          )}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-2">
              <label htmlFor="pin" className="text-sm font-medium">
                PIN de Acesso
              </label>
              <Input
                id="pin"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Digite seu PIN"
                className="bg-gray-700 border-gray-600 text-sm"
              />
              {error && (
                <p className="text-red-500 text-xs animate-shake">{error}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-netflix-red hover:bg-red-700 transition-colors duration-300 text-sm py-2"
              disabled={loading}
            >
              {loading ? "Verificando..." : "Acessar"}
            </Button>
          </form>
          
          {/* Cadeado de admin abaixo do botão */}
          <div className="flex justify-center mt-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-netflix-gray hover:text-white h-8 w-8"
              onClick={() => setShowAdminModal(true)}
            >
              <Lock className="w-4 h-4" />
            </Button>
          </div>
          
          <p className="text-xs text-netflix-gray mt-3 text-center">
            Entre em contato com o administrador para obter um PIN de acesso.
          </p>
        </div>
      </div>
      
      {/* Admin login modal */}
      <AdminModal 
        open={showAdminModal} 
        onOpenChange={setShowAdminModal} 
        onSuccessfulLogin={handleSuccessfulAdminLogin}
      />
    </div>
  );
};

export default PinLoginForm;
