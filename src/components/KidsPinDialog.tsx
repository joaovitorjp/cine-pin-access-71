import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Lock } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onValidate: (pin: string) => boolean;
  title?: string;
  description?: string;
}

const KidsPinDialog: React.FC<Props> = ({
  open,
  onOpenChange,
  onValidate,
  title = "PIN Parental",
  description = "Digite o PIN parental para sair do Modo Kids.",
}) => {
  const [pin, setPin] = useState("");

  const submit = () => {
    if (onValidate(pin)) {
      toast({ title: "Acesso liberado" });
      setPin("");
      onOpenChange(false);
    } else {
      toast({ title: "PIN incorreto", variant: "destructive" });
      setPin("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-4 h-4" /> {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="parental-pin">PIN</Label>
          <Input
            id="parental-pin"
            type="password"
            inputMode="numeric"
            autoFocus
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Digite o PIN"
          />
          <p className="text-xs text-muted-foreground">PIN padrão: 1234 (altere nas preferências).</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={submit}>Confirmar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default KidsPinDialog;
