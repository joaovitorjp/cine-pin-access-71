import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Coins, Minus, Plus, ArrowLeft } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";
import { StripeEmbeddedCheckout } from "@/components/StripeEmbeddedCheckout";

interface BuyCoinsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPurchased?: (newBalance: number) => void;
}

const PACKS: { id: string; coins: number; price: number; badge?: string }[] = [
  { id: "coins_pack_5", coins: 5, price: 5 },
  { id: "coins_pack_10", coins: 10, price: 10, badge: "Popular" },
  { id: "coins_pack_25", coins: 25, price: 25 },
  { id: "coins_pack_50", coins: 50, price: 50 },
  { id: "coins_pack_100", coins: 100, price: 100, badge: "Melhor valor" },
];

type CheckoutSel =
  | { mode: "pack"; priceId: string; coins: number }
  | { mode: "custom"; coins: number };

const BuyCoinsDialog: React.FC<BuyCoinsDialogProps> = ({ open, onOpenChange }) => {
  const { balance } = useWallet();
  const [tab, setTab] = useState<"packs" | "custom">("packs");
  const [customAmount, setCustomAmount] = useState(10);
  const [checkout, setCheckout] = useState<CheckoutSel | null>(null);

  const returnUrl = `${window.location.origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`;

  const handleClose = (o: boolean) => {
    if (!o) setCheckout(null);
    onOpenChange(o);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-lg max-h-[90vh] overflow-y-auto">
        {checkout ? (
          <>
            <DialogHeader>
              <button
                onClick={() => setCheckout(null)}
                className="flex items-center gap-1 text-sm text-zinc-400 hover:text-white mb-2 w-fit"
              >
                <ArrowLeft className="w-4 h-4" /> Voltar
              </button>
              <DialogTitle className="text-xl">Finalizar pagamento</DialogTitle>
              <DialogDescription className="text-zinc-400">
                {checkout.coins} moedas · R$ {checkout.coins.toFixed(2).replace(".", ",")}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-2">
              <StripeEmbeddedCheckout
                mode={checkout.mode}
                priceId={checkout.mode === "pack" ? checkout.priceId : undefined}
                coins={checkout.mode === "custom" ? checkout.coins : undefined}
                returnUrl={returnUrl}
              />
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Coins className="w-5 h-5 text-amber-400" />
                Comprar moedas
              </DialogTitle>
              <DialogDescription className="text-zinc-400">
                1 moeda = R$ 1,00 = 1 filme desbloqueado.
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

            <div className="flex gap-1 p-1 bg-zinc-900 rounded-xl border border-zinc-800">
              <button
                onClick={() => setTab("packs")}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  tab === "packs" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                Pacotes
              </button>
              <button
                onClick={() => setTab("custom")}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  tab === "custom" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                Quantidade livre
              </button>
            </div>

            {tab === "packs" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PACKS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setCheckout({ mode: "pack", priceId: p.id, coins: p.coins })}
                    className="relative text-left rounded-xl bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 hover:bg-zinc-900/80 p-4 transition-all"
                  >
                    {p.badge && (
                      <span className="absolute -top-2 right-3 text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-zinc-950 px-2 py-0.5 rounded-full">
                        {p.badge}
                      </span>
                    )}
                    <div className="flex items-center gap-2 mb-1">
                      <Coins className="w-4 h-4 text-amber-400" />
                      <span className="text-lg font-bold">{p.coins} moedas</span>
                    </div>
                    <p className="text-sm text-zinc-400">R$ {p.price.toFixed(2).replace(".", ",")}</p>
                  </button>
                ))}
              </div>
            ) : (
              <div>
                <p className="text-sm text-zinc-300 mb-2">Quantidade</p>
                <div className="flex items-center gap-3 bg-zinc-900 rounded-xl p-2 border border-zinc-800">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="rounded-lg h-9 w-9 text-white hover:bg-zinc-800"
                    onClick={() => setCustomAmount((a) => Math.max(1, a - 1))}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    value={customAmount}
                    onChange={(e) => setCustomAmount(Math.max(1, Math.min(1000, parseInt(e.target.value) || 1)))}
                    className="flex-1 bg-transparent text-center text-xl font-bold focus:outline-none"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="rounded-lg h-9 w-9 text-white hover:bg-zinc-800"
                    onClick={() => setCustomAmount((a) => Math.min(1000, a + 1))}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-zinc-900/50 border border-zinc-800 px-4 py-3 mt-3">
                  <span className="text-sm text-zinc-400">Total</span>
                  <span className="text-lg font-bold">
                    R$ {customAmount.toFixed(2).replace(".", ",")}
                  </span>
                </div>
                <Button
                  onClick={() => setCheckout({ mode: "custom", coins: customAmount })}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold mt-3"
                >
                  Continuar para pagamento
                </Button>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BuyCoinsDialog;
