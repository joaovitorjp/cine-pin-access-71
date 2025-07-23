
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Film, Tv, Key, MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useState, useEffect } from "react";

interface AdminStatsProps {
  moviesCount: number;
  seriesCount: number;
  pinsCount: number;
}

const AdminStats: React.FC<AdminStatsProps> = ({ moviesCount, seriesCount, pinsCount }) => {
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchWelcomeMessage = async () => {
      const docRef = doc(db, "settings", "welcomeMessage");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setWelcomeMessage(docSnap.data().message || "");
      }
    };
    fetchWelcomeMessage();
  }, []);

  const handleSaveMessage = async () => {
    setIsSaving(true);
    try {
      await setDoc(doc(db, "settings", "welcomeMessage"), {
        message: welcomeMessage,
        updatedAt: new Date()
      });
      toast({
        title: "Mensagem salva",
        description: "A mensagem de boas-vindas foi atualizada com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao salvar mensagem:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a mensagem.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid gap-4 mb-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-netflix-dark border-gray-800">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <Film className="w-8 h-8 text-netflix-red" />
            <div>
              <p className="text-sm text-gray-400">Filmes</p>
              <p className="text-2xl font-bold">{moviesCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-netflix-dark border-gray-800">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <Tv className="w-8 h-8 text-netflix-red" />
            <div>
              <p className="text-sm text-gray-400">Séries</p>
              <p className="text-2xl font-bold">{seriesCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-netflix-dark border-gray-800">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <Key className="w-8 h-8 text-netflix-red" />
            <div>
              <p className="text-sm text-gray-400">PINs Ativos</p>
              <p className="text-2xl font-bold">{pinsCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-netflix-dark border-gray-800">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4 mb-4">
            <MessageCircle className="w-8 h-8 text-netflix-red" />
            <div>
              <p className="text-sm text-gray-400">Mensagem de Boas-vindas</p>
            </div>
          </div>
          <div className="space-y-2">
            <Input
              value={welcomeMessage}
              onChange={(e) => setWelcomeMessage(e.target.value)}
              placeholder="Digite a mensagem de boas-vindas"
              className="bg-gray-800 border-gray-700"
            />
            <Button 
              onClick={handleSaveMessage} 
              disabled={isSaving}
              className="w-full bg-netflix-red hover:bg-red-700"
            >
              {isSaving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminStats;
