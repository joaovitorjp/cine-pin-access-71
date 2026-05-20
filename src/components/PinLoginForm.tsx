import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import AnimatedBackground from "@/components/AnimatedBackground";
import FeaturedLoginCarousel from "@/components/FeaturedLoginCarousel";
import { getAllMovies } from "@/services/movieService";
import { getAllSeries } from "@/services/seriesService";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Loader2, MessageCircle, ShieldCheck, Sparkles, Tv, Film, Copy, CheckCircle2, Globe } from "lucide-react";

const PLANS = [
  { days: 7, price: "5,99", priceNum: 5.99, label: "7 dias", highlight: false },
  { days: 15, price: "11,99", priceNum: 11.99, label: "15 dias", highlight: true },
  { days: 30, price: "21,99", priceNum: 21.99, label: "30 dias", highlight: false },
];

const SUPPORT_WHATS = "https://wa.me/5566984640346?text=Olá!%20Gostaria%20de%20um%20token%20personalizado%20para%20o%20CINE%20FLEX.";

const PinLoginForm: React.FC = () => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [moviesCount, setMoviesCount] = useState(0);
  const [seriesCount, setSeriesCount] = useState(0);
  const [buyingPlan, setBuyingPlan] = useState<number | null>(null);
  const [generatedPin, setGeneratedPin] = useState<string | null>(null);
  const [pollingPayment, setPollingPayment] = useState(false);
  const [copied, setCopied] = useState(false);
  const { loginWithPin } = useAuth();

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDoc(doc(db, "settings", "welcomeMessage"));
        if (snap.exists() && snap.data().message) setWelcomeMessage(snap.data().message);
      } catch (e) { console.error(e); }
    })();

    (async () => {
      try {
        const [m, s] = await Promise.all([getAllMovies(), getAllSeries()]);
        setMoviesCount(m.length);
        setSeriesCount(s.length);
      } catch (e) { console.error(e); }
    })();
  }, []);

  // Detecta retorno do Mercado Pago e busca o PIN gerado
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentId = params.get("payment_id");
    if (!paymentId) return;
    setPollingPayment(true);

    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      const { data } = await supabase
        .from("payments")
        .select("generated_pin,status")
        .eq("id", paymentId)
        .maybeSingle();

      if (data?.generated_pin) {
        setGeneratedPin(data.generated_pin);
        setPollingPayment(false);
        clearInterval(interval);
        window.history.replaceState({}, "", window.location.pathname);
      } else if (attempts > 30) {
        setPollingPayment(false);
        clearInterval(interval);
        toast({
          title: "Pagamento em processamento",
          description: "Assim que aprovado, seu PIN será liberado. Entre em contato com o suporte se demorar.",
        });
        window.history.replaceState({}, "", window.location.pathname);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin) return setError("Digite seu PIN de acesso");
    setLoading(true); setError("");
    try {
      const ok = await loginWithPin(pin);
      if (!ok) setError("PIN inválido ou expirado");
    } catch (err) {
      console.error(err);
      setError("Erro ao fazer login. Tente novamente.");
    } finally { setLoading(false); }
  };

  const handleBuy = async (days: number) => {
    setBuyingPlan(days);
    try {
      const { data, error } = await supabase.functions.invoke("create-mp-payment", {
        body: { plan: days, origin: window.location.origin },
      });
      if (error) throw error;
      if (!data?.init_point) throw new Error("Não foi possível criar o pagamento");
      window.location.href = data.init_point;
    } catch (err) {
      console.error(err);
      toast({
        title: "Erro ao iniciar pagamento",
        description: err instanceof Error ? err.message : "Tente novamente.",
        variant: "destructive",
      });
      setBuyingPlan(null);
    }
  };

  const copyPin = () => {
    if (!generatedPin) return;
    navigator.clipboard.writeText(generatedPin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen min-h-[100dvh] w-full overflow-y-auto relative">
      <AnimatedBackground />
      <FeaturedLoginCarousel />

      {/* Gradiente para legibilidade */}
      <div className="fixed inset-0 z-10 bg-gradient-to-b from-black/80 via-black/60 to-black/90 pointer-events-none" />

      <div className="relative z-20 w-full max-w-6xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <header className="flex items-center justify-between mb-8 md:mb-12">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-netflix-red flex items-center justify-center shadow-lg shadow-netflix-red/40">
              <Film className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-white">CINE FLEX</h1>
              <p className="text-[10px] md:text-xs text-netflix-gray flex items-center gap-1">
                <Globe className="w-3 h-3" /> www.cineflex.com.br
              </p>
            </div>
          </div>
          <a
            href={SUPPORT_WHATS}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-green-600/90 hover:bg-green-600 text-white text-xs md:text-sm font-medium transition-all shadow-lg shadow-green-600/30"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Suporte</span>
          </a>
        </header>

        {/* PIN gerado após pagamento */}
        {generatedPin && (
          <div className="mb-8 p-5 rounded-2xl bg-gradient-to-br from-green-600/30 to-emerald-700/20 border border-green-500/50 backdrop-blur-xl animate-fade-in">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-white font-bold text-lg">Pagamento aprovado!</h3>
                <p className="text-sm text-white/80 mb-3">Seu PIN de acesso foi gerado. Copie e use para entrar:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-4 py-3 rounded-lg bg-black/60 text-green-400 font-mono text-2xl font-bold tracking-widest text-center">
                    {generatedPin}
                  </code>
                  <Button onClick={copyPin} size="icon" variant="secondary" className="h-12 w-12">
                    {copied ? <CheckCircle2 className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {pollingPayment && !generatedPin && (
          <div className="mb-8 p-4 rounded-2xl bg-blue-600/20 border border-blue-500/40 backdrop-blur-xl flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-blue-300 animate-spin" />
            <p className="text-sm text-white">Confirmando seu pagamento e gerando o PIN...</p>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Coluna esquerda: apresentação + planos */}
          <div className="space-y-6">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-netflix-red/20 border border-netflix-red/40 text-netflix-red text-xs font-semibold mb-4">
                <Sparkles className="w-3 h-3" /> Streaming Premium
              </span>
              <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-3">
                Filmes, séries e <span className="text-netflix-red">TV ao vivo</span> sem limites.
              </h2>
              <p className="text-netflix-gray text-sm md:text-base leading-relaxed">
                {welcomeMessage || `Mais de ${moviesCount || "milhares de"} filmes e ${seriesCount || "centenas de"} séries, atualizados toda semana. Acesso liberado em segundos após o pagamento.`}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <Film className="w-5 h-5 text-netflix-red mb-1" />
                <p className="text-xl font-bold text-white">{moviesCount || "..."}</p>
                <p className="text-[10px] text-netflix-gray uppercase">Filmes</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <Tv className="w-5 h-5 text-netflix-red mb-1" />
                <p className="text-xl font-bold text-white">{seriesCount || "..."}</p>
                <p className="text-[10px] text-netflix-gray uppercase">Séries</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <ShieldCheck className="w-5 h-5 text-netflix-red mb-1" />
                <p className="text-xl font-bold text-white">100%</p>
                <p className="text-[10px] text-netflix-gray uppercase">Seguro</p>
              </div>
            </div>

            {/* Planos */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-bold text-lg">Adquira seu token</h3>
                <span className="text-[10px] text-netflix-gray uppercase tracking-wider">Pagamento automático</span>
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                {PLANS.map((p) => (
                  <div
                    key={p.days}
                    className={`relative p-4 rounded-xl border backdrop-blur-md transition-all ${
                      p.highlight
                        ? "bg-gradient-to-br from-netflix-red/30 to-netflix-red/10 border-netflix-red/60 shadow-lg shadow-netflix-red/20"
                        : "bg-white/5 border-white/10 hover:border-white/20"
                    }`}
                  >
                    {p.highlight && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-netflix-red text-white text-[9px] font-bold uppercase">
                        Popular
                      </span>
                    )}
                    <p className="text-xs text-netflix-gray mb-1">{p.label}</p>
                    <p className="text-2xl font-extrabold text-white mb-0.5">
                      R$ {p.price}
                    </p>
                    <p className="text-[10px] text-netflix-gray mb-3">Acesso por {p.days} dias</p>
                    <Button
                      onClick={() => handleBuy(p.days)}
                      disabled={buyingPlan !== null}
                      className={`w-full text-xs h-9 ${
                        p.highlight
                          ? "bg-netflix-red hover:bg-red-700"
                          : "bg-white/10 hover:bg-white/20 text-white"
                      }`}
                    >
                      {buyingPlan === p.days ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Comprar"
                      )}
                    </Button>
                  </div>
                ))}
              </div>

              <a
                href={SUPPORT_WHATS}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-sm text-white transition-all"
              >
                <MessageCircle className="w-4 h-4 text-green-400" />
                Token personalizado? Fale com o suporte
              </a>
            </div>
          </div>

          {/* Coluna direita: login */}
          <div className="lg:sticky lg:top-8">
            <div className="p-6 md:p-8 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-xl shadow-2xl">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-1">Já é assinante?</h2>
                <p className="text-sm text-netflix-gray">Acesse com seu PIN para continuar assistindo.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="pin" className="text-xs font-medium text-netflix-gray uppercase tracking-wider">
                    PIN de Acesso
                  </label>
                  <Input
                    id="pin"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="••••••"
                    className="bg-white/5 border-white/10 text-white text-center text-xl tracking-[0.4em] font-mono h-14 placeholder:text-white/20"
                  />
                  {error && <p className="text-red-400 text-xs animate-shake">{error}</p>}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-netflix-red hover:bg-red-700 h-12 text-base font-semibold transition-all shadow-lg shadow-netflix-red/30"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Entrar"}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-xs text-netflix-gray text-center leading-relaxed">
                  Ao entrar, você concorda com nossos termos.<br />
                  Cada PIN funciona em <strong className="text-white">1 dispositivo por vez</strong>.
                </p>
              </div>
            </div>

            <p className="text-center text-[10px] text-netflix-gray/60 mt-4">
              © {new Date().getFullYear()} CINE FLEX · www.cineflex.com.br
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PinLoginForm;
