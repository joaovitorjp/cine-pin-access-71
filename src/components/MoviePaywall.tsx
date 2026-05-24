import React, { useState } from "react";
import { Coins, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
        toast({ title: res.already ? "Acesso liberado" : "Filme desbloqueado", description: res.already ? "Você já havia desbloqueado este filme." : "1 moeda foi debitada da sua carteira." });
        onUnlocked();
      } else {
        toast({ title: "Saldo insuficiente", description: "Compre moedas para continuar.", variant: "destructive" });
        setBuyOpen(true);
      }
    } catch {
      toast({ title: "Erro ao desbloquear", description: "Tente novamente.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        {posterUrl && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-40"
            style={{ backgroundImage: `url(${posterUrl})` }}
          />
        )}
        <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
        <div className="relative w-[92%] max-w-md rounded-2xl bg-zinc-950/90 border border-zinc-800 p-6 shadow-2xl text-center">
          <div className="mx-auto w-14 h-14 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-amber-400" />
          </div>
          <h2 className="text-white text-lg font-bold mb-1">Desbloqueie para assistir</h2>
          <p className="text-zinc-400 text-sm mb-5 line-clamp-2">
            Pague <span className="text-amber-300 font-semibold">1 moeda</span> para liberar “{movieTitle}”.
          </p>

          <div className="flex items-center justify-center gap-2 mb-5 text-sm text-zinc-300">
            <Coins className="w-4 h-4 text-amber-400" />
            Saldo: <span className="font-semibold text-white">{balance}</span> moedas
          </div>

          <Button
            onClick={handlePay}
            disabled={loading}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : insufficient ? (
              "Comprar moedas"
            ) : (
              <>
                <Coins className="w-4 h-4" /> Pagar 1 moeda e assistir
              </>
            )}
          </Button>
          {!insufficient && (
            <button
              onClick={() => setBuyOpen(true)}
              className="mt-3 text-xs text-zinc-400 hover:text-amber-300 underline-offset-2 hover:underline"
            >
              Adicionar mais moedas
            </button>
          )}
        </div>
      </div>
      <BuyCoinsDialog open={buyOpen} onOpenChange={setBuyOpen} />
    </>
  );
};

export default MoviePaywall;
