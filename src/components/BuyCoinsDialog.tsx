import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Coins, Minus, Plus, Loader2 } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";
import { toast } from "@/components/ui/use-toast";

interface BuyCoinsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPurchased?: (newBalance: number) => void;
}

const PRESETS = [5, 10, 25, 50];

const BuyCoinsDialog: React.FC<BuyCoinsDialogProps> = ({ open, onOpenChange, onPurchased }) => {
  const { addCoins, balance } = useWallet();
  const [amount, setAmount] = useState(10);
  const [loading, setLoading] = useState(false);

  const handleBuy = async () => {
    if (amount <= 0) return;
    setLoading(true);
    try {
      const nb = await addCoins(amount);
      toast({ title: "Compra realizada", description: `+${amount} moedas adicionadas à sua carteira.` });
      onPurchased?.(nb);
      onOpenChange(false);
    } catch (e) {
      toast({ title: "Erro na compra", description: "Tente novamente.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Coins className="w-5 h-5 text-amber-400" />
            Comprar moedas
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Cada moeda custa R$ 1,00 e permite desbloquear 1 filme.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-2xl bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-transparent border border-amber-500/20 p-4">
          <p className="text-xs text-zinc-400 mb-1">Saldo atual</p>
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-400" />
            <span className="text-2xl font-bold">{balance}</span>
            <span className="text-sm text-zinc-400">moedas</span>
          </div>
        </div>

        <div>
          <p className="text-sm text-zinc-300 mb-2">Quantidade</p>
          <div className="flex items-center gap-3 bg-zinc-900 rounded-xl p-2 border border-zinc-800">
            <Button
              size="icon"
              variant="ghost"
              className="rounded-lg h-9 w-9 text-white hover:bg-zinc-800"
              onClick={() => setAmount((a) => Math.max(1, a - 1))}
              disabled={loading}
            >
              <Minus className="w-4 h-4" />
            </Button>
            <input
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value) || 1))}
              className="flex-1 bg-transparent text-center text-xl font-bold focus:outline-none"
              disabled={loading}
            />
            <Button
              size="icon"
              variant="ghost"
              className="rounded-lg h-9 w-9 text-white hover:bg-zinc-800"
              onClick={() => setAmount((a) => a + 1)}
              disabled={loading}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="grid grid-cols-4 gap-2 mt-3">
            {PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => setAmount(p)}
                disabled={loading}
                className={`py-2 rounded-lg text-sm font-medium border transition-colors ${
                  amount === p
                    ? "bg-amber-500/20 border-amber-500/50 text-amber-200"
                    : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-zinc-900/50 border border-zinc-800 px-4 py-3">
          <span className="text-sm text-zinc-400">Total</span>
          <span className="text-lg font-bold">R$ {amount.toFixed(2).replace(".", ",")}</span>
        </div>

        <Button
          onClick={handleBuy}
          disabled={loading || amount <= 0}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : `Finalizar compra · +${amount} moedas`}
        </Button>
        <p className="text-[11px] text-center text-zinc-500 -mt-1">
          Pagamento simulado · moedas creditadas imediatamente
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default BuyCoinsDialog;
