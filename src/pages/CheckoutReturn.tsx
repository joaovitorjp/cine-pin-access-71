import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/contexts/WalletContext";

export default function CheckoutReturn() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const { refresh, balance, loading } = useWallet();

  useEffect(() => {
    // Webhook may take a moment — poll briefly
    let cancelled = false;
    const start = Date.now();
    const tick = async () => {
      if (cancelled) return;
      await refresh();
      if (Date.now() - start < 10000) {
        setTimeout(tick, 1500);
      }
    };
    tick();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full rounded-2xl bg-zinc-950 border border-zinc-800 p-8 text-center">
        {sessionId ? (
          <>
            <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Pagamento confirmado</h1>
            <p className="text-zinc-400 mb-6">
              Suas moedas estão sendo creditadas na sua carteira.
            </p>
            <div className="rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3 mb-6 flex items-center justify-between">
              <span className="text-sm text-zinc-400">Saldo atual</span>
              <span className="text-xl font-bold text-amber-400 flex items-center gap-2">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {balance} moedas
              </span>
            </div>
            <Button asChild className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold">
              <Link to="/">Voltar para o início</Link>
            </Button>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-white mb-2">Sessão não encontrada</h1>
            <Button asChild variant="outline">
              <Link to="/">Voltar</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
