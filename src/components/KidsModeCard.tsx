import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Baby, Lock, KeyRound } from "lucide-react";
import { useKidsMode } from "@/contexts/KidsModeContext";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";

const KidsModeCard: React.FC = () => {
  const { isKidsMode, enableKidsMode, setParentalPin, parentalPin } = useKidsMode();
  const navigate = useNavigate();
  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  const handleEnable = () => {
    enableKidsMode();
    navigate("/kids");
  };

  const handleChangePin = () => {
    if (newPin !== confirmPin) {
      toast({ title: "Os PINs não coincidem", variant: "destructive" });
      return;
    }
    if (!/^\d{4,6}$/.test(newPin)) {
      toast({ title: "PIN inválido", description: "Use de 4 a 6 dígitos.", variant: "destructive" });
      return;
    }
    if (setParentalPin(currentPin, newPin)) {
      toast({ title: "PIN parental atualizado" });
      setPinDialogOpen(false);
      setCurrentPin("");
      setNewPin("");
      setConfirmPin("");
    } else {
      toast({ title: "PIN atual incorreto", variant: "destructive" });
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Baby className="w-5 h-5 text-pink-500" />
          Modo Kids
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Experiência segura para crianças com conteúdo infantil aprovado, proteção por PIN parental
          e bloqueio de buscas inadequadas.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={handleEnable} className="flex-1 gap-2">
            <Baby className="w-4 h-4" />
            {isKidsMode ? "Ir para o Modo Kids" : "Ativar Modo Kids"}
          </Button>
          <Button variant="outline" onClick={() => setPinDialogOpen(true)} className="gap-2">
            <KeyRound className="w-4 h-4" />
            Alterar PIN
          </Button>
        </div>
        <div className="flex items-start gap-2 text-xs text-muted-foreground rounded-md bg-muted/50 p-3">
          <Lock className="w-4 h-4 mt-0.5" />
          <span>
            Para sair do Modo Kids é necessário inserir o PIN parental. O PIN padrão é{" "}
            <strong>1234</strong>. Recomendamos alterá-lo.
          </span>
        </div>
      </CardContent>

      <Dialog open={pinDialogOpen} onOpenChange={setPinDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Alterar PIN parental</DialogTitle>
            <DialogDescription>Informe o PIN atual e o novo PIN (4 a 6 dígitos).</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="cur">PIN atual</Label>
              <Input
                id="cur"
                type="password"
                inputMode="numeric"
                value={currentPin}
                onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
              />
            </div>
            <div>
              <Label htmlFor="new">Novo PIN</Label>
              <Input
                id="new"
                type="password"
                inputMode="numeric"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
              />
            </div>
            <div>
              <Label htmlFor="conf">Confirmar novo PIN</Label>
              <Input
                id="conf"
                type="password"
                inputMode="numeric"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPinDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleChangePin}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default KidsModeCard;
