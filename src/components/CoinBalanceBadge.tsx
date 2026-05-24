import React, { useState } from "react";
import { Coins, Plus } from "lucide-react";
import BuyCoinsDialog from "@/components/BuyCoinsDialog";
import { useWallet } from "@/contexts/WalletContext";

const CoinBalanceBadge: React.FC = () => {
  const { balance } = useWallet();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group flex items-center gap-1.5 pl-2 pr-1 py-1 rounded-full bg-gradient-to-r from-amber-500/15 to-amber-600/10 border border-amber-500/30 hover:border-amber-400/60 transition-colors"
        aria-label="Comprar moedas"
      >
        <Coins className="w-4 h-4 text-amber-400" />
        <span className="text-sm font-semibold text-amber-100 tabular-nums">{balance}</span>
        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-zinc-950 group-hover:scale-105 transition-transform">
          <Plus className="w-3 h-3" strokeWidth={3} />
        </span>
      </button>
      <BuyCoinsDialog open={open} onOpenChange={setOpen} />
    </>
  );
};

export default CoinBalanceBadge;
