
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface AdminModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccessfulLogin: () => void;
}

const AdminModal: React.FC<AdminModalProps> = ({ open, onOpenChange, onSuccessfulLogin }) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { loginAsAdmin } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError("Por favor, insira a senha");
      return;
    }

    const success = await loginAsAdmin(password);
    if (success) {
      onOpenChange(false);
      onSuccessfulLogin();
      setPassword("");
      setError("");
    } else {
      setError("Falha na autenticação");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-netflix-dark text-white">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Acesso Administrativo</DialogTitle>
          <DialogDescription className="text-netflix-gray">
            Digite a senha para acessar o painel administrativo.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="Digite a senha admin"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-gray-700 border-gray-600"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>

          <Button type="submit" className="w-full bg-netflix-red hover:bg-red-700">
            Entrar
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdminModal;
