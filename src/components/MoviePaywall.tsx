import React, { useState } from "react";
import { Coins, Lock, Loader2 } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";
import BuyCoinsDialog from "@/components/BuyCoinsDialog";
import { toast } from "@/components/ui/use-toast";

interface MoviePaywallProps {
  movieId: string;
  movieTitle: string;
  posterUrl?: string;
  onUnlocked: () => void;
}

const MoviePaywall: React.FC<MoviePaywallProps> = ({ movieId, movieTitle, posterUrl, onUnlocked }) => {
  const { balance, unlockMovie } = useWallet();
  const [loading, setLoading] = useState(false);
  const [buyOpen, setBuyOpen] = useState(false);

  const insufficient = balance < 1;

  const handlePay = async () => {
    if (insufficient) {
      setBuyOpen(true);
      return;
    }
    setLoading(true);
    try {
      const res = await unlockMovie(movieId);
      if (res.unlocked) {
        toast({
          title: res.already ? "Acesso liberado" : "Filme desbloqueado",
          description: res.already ? "Você já havia desbloqueado este filme." : "1 moeda foi debitada.",
        });
        onUnlocked();
      } else {
        toast({ title: "Saldo insuficiente", description: "Compre moedas para continuar.", variant: "destructive" });
        setBuyOpen(true);
      }
    } catch (e: any) {
      console.error("unlock_movie error", e);
      toast({ title: "Erro ao desbloquear", description: e?.message || "Tente novamente.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="absolute inset-0 z-10 flex items-center justify-center px-4">
        {posterUrl && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30"
            style={{ backgroundImage: `url(${posterUrl})` }}
          />
        )}
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
        <div className="relative w-full max-w-[320px] rounded-xl bg-zinc-950/95 border border-zinc-800 px-4 py-4 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-sm font-semibold truncate">Conteúdo bloqueado</p>
              <p className="text-zinc-400 text-xs flex items-center gap-1">
                Saldo: <Coins className="w-3 h-3 text-amber-400" />
                <span className="text-white font-medium">{balance}</span>
              </p>
            </div>
          </div>

          <button
            onClick={handlePay}
            disabled={loading}
            className="mt-3 w-full h-10 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : insufficient ? (
              <>Comprar moedas</>
            ) : (
              <>
                <Coins className="w-4 h-4" /> Pagar 1 moeda e assistir
              </>
            )}
          </button>
        </div>
      </div>
      <BuyCoinsDialog open={buyOpen} onOpenChange={setBuyOpen} />
    </>
  );
};

export default MoviePaywall;
