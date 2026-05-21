import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PinAccess } from "@/types";
import { updatePinAdmin } from "@/services/pinService";
import { toast } from "@/components/ui/use-toast";
import { calculateExpiryDate } from "@/lib/utils";

interface EditPinFormProps {
  pin: PinAccess;
  onSuccess: () => void;
}

const EditPinForm: React.FC<EditPinFormProps> = ({ pin, onSuccess }) => {
  const [clientName, setClientName] = useState(pin.clientName || "");
  const [pinCode, setPinCode] = useState(pin.pin);
  const [daysValid, setDaysValid] = useState<number>(pin.daysValid);
  const [isActive, setIsActive] = useState<boolean>(pin.isActive);
  const [renewExpiry, setRenewExpiry] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!clientName.trim()) return setError("Nome do cliente é obrigatório");
    if (!pinCode.trim() || pinCode.trim().length < 4)
      return setError("O PIN deve ter pelo menos 4 caracteres");
    if (!daysValid || daysValid <= 0) return setError("Dias deve ser maior que zero");

    setLoading(true);
    try {
      await updatePinAdmin(pin.id, {
        clientName,
        pin: pinCode,
        daysValid,
        isActive,
        ...(renewExpiry ? { expiryDate: calculateExpiryDate(daysValid) } : {}),
      });
      toast({ title: "PIN atualizado", description: "As alterações foram salvas." });
      onSuccess();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao atualizar PIN";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="edit-name">Nome do Cliente</Label>
        <Input
          id="edit-name"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          className="bg-gray-700 border-gray-600"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-pin">PIN de Acesso</Label>
        <Input
          id="edit-pin"
          value={pinCode}
          onChange={(e) => setPinCode(e.target.value)}
          className="bg-gray-700 border-gray-600 font-mono"
          minLength={4}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-days">Dias Liberados (plano)</Label>
        <Input
          id="edit-days"
          type="number"
          min={1}
          value={daysValid}
          onChange={(e) => setDaysValid(Number(e.target.value))}
          className="bg-gray-700 border-gray-600"
          required
        />
        <div className="flex items-center gap-2 pt-1">
          <Switch
            id="renew-expiry"
            checked={renewExpiry}
            onCheckedChange={setRenewExpiry}
          />
          <Label htmlFor="renew-expiry" className="text-sm text-netflix-gray">
            Renovar data de expiração a partir de hoje
          </Label>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-md border border-gray-700 p-3">
        <div>
          <Label htmlFor="edit-active" className="text-base">Status da Conta</Label>
          <p className="text-xs text-netflix-gray">Ativar ou desativar este PIN</p>
        </div>
        <Switch id="edit-active" checked={isActive} onCheckedChange={setIsActive} />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex justify-end">
        <Button type="submit" disabled={loading} className="bg-netflix-red hover:bg-red-700">
          {loading ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </div>
    </form>
  );
};

export default EditPinForm;
