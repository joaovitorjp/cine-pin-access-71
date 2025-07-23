
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createPin, createCustomPin } from "@/services/pinService";
import { toast } from "@/components/ui/use-toast";

interface CreatePinFormProps {
  onSuccess: () => void;
}

const CreatePinForm: React.FC<CreatePinFormProps> = ({ onSuccess }) => {
  const [daysValid, setDaysValid] = useState(7);
  const [clientName, setClientName] = useState("");
  const [customPin, setCustomPin] = useState("");
  const [customDaysValid, setCustomDaysValid] = useState(7);
  const [customClientName, setCustomClientName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRandomPinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clientName.trim()) {
      setError("Por favor, digite o nome do cliente");
      return;
    }
    
    if (daysValid <= 0) {
      setError("O número de dias deve ser maior que zero");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const newPin = await createPin(daysValid, clientName.trim());
      
      toast({
        title: "PIN criado com sucesso",
        description: `PIN: ${newPin.pin} - Cliente: ${clientName} - Válido por ${daysValid} dias`,
      });
      
      onSuccess();
    } catch (error) {
      console.error("Erro ao criar PIN:", error);
      setError("Ocorreu um erro ao criar o PIN. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleCustomPinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customClientName.trim()) {
      setError("Por favor, digite o nome do cliente");
      return;
    }
    
    if (!customPin.trim()) {
      setError("Por favor, digite um PIN personalizado");
      return;
    }
    
    if (customPin.length < 4) {
      setError("O PIN deve ter pelo menos 4 caracteres");
      return;
    }
    
    if (customDaysValid <= 0) {
      setError("O número de dias deve ser maior que zero");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const newPin = await createCustomPin(customPin.trim(), customDaysValid, customClientName.trim());
      
      toast({
        title: "PIN personalizado criado com sucesso",
        description: `PIN: ${newPin.pin} - Cliente: ${customClientName} - Válido por ${customDaysValid} dias`,
      });
      
      onSuccess();
    } catch (error) {
      console.error("Erro ao criar PIN personalizado:", error);
      setError("Ocorreu um erro ao criar o PIN personalizado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Tabs defaultValue="random" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="random">PIN Aleatório</TabsTrigger>
        <TabsTrigger value="custom">PIN Personalizado</TabsTrigger>
      </TabsList>
      
      <TabsContent value="random">
        <form onSubmit={handleRandomPinSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="clientName">Nome do Cliente</Label>
            <Input
              id="clientName"
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Digite o nome do cliente"
              className="bg-gray-700 border-gray-600"
              required
            />
            <p className="text-sm text-netflix-gray">
              Nome da pessoa que irá usar este PIN.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="daysValid">Dias de Validade</Label>
            <Input
              id="daysValid"
              type="number"
              value={daysValid}
              onChange={(e) => setDaysValid(Number(e.target.value))}
              className="bg-gray-700 border-gray-600"
              min={1}
              required
            />
            <p className="text-sm text-netflix-gray">
              Define por quantos dias este PIN será válido após a criação.
            </p>
          </div>
          
          {error && <p className="text-red-500 text-sm">{error}</p>}
          
          <div className="flex justify-end">
            <Button
              type="submit"
              className="bg-netflix-red hover:bg-red-700"
              disabled={loading}
            >
              {loading ? "Criando..." : "Criar PIN"}
            </Button>
          </div>
        </form>
      </TabsContent>
      
      <TabsContent value="custom">
        <form onSubmit={handleCustomPinSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customClientName">Nome do Cliente</Label>
            <Input
              id="customClientName"
              type="text"
              value={customClientName}
              onChange={(e) => setCustomClientName(e.target.value)}
              placeholder="Digite o nome do cliente"
              className="bg-gray-700 border-gray-600"
              required
            />
            <p className="text-sm text-netflix-gray">
              Nome da pessoa que irá usar este PIN.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="customPin">PIN Personalizado</Label>
            <Input
              id="customPin"
              type="text"
              value={customPin}
              onChange={(e) => setCustomPin(e.target.value)}
              placeholder="Digite o PIN desejado"
              className="bg-gray-700 border-gray-600"
              minLength={4}
              required
            />
            <p className="text-sm text-netflix-gray">
              Digite um PIN personalizado com pelo menos 4 caracteres.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="customDaysValid">Dias de Validade</Label>
            <Input
              id="customDaysValid"
              type="number"
              value={customDaysValid}
              onChange={(e) => setCustomDaysValid(Number(e.target.value))}
              className="bg-gray-700 border-gray-600"
              min={1}
              required
            />
            <p className="text-sm text-netflix-gray">
              Define por quantos dias este PIN será válido após a criação.
            </p>
          </div>
          
          {error && <p className="text-red-500 text-sm">{error}</p>}
          
          <div className="flex justify-end">
            <Button
              type="submit"
              className="bg-netflix-red hover:bg-red-700"
              disabled={loading}
            >
              {loading ? "Criando..." : "Criar PIN Personalizado"}
            </Button>
          </div>
        </form>
      </TabsContent>
    </Tabs>
  );
};

export default CreatePinForm;
