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
import { Loader2, MessageCircle, ShieldCheck, Sparkles, Tv, Film, Copy, CheckCircle2, Globe, LogIn } from "lucide-react";
import cineflexLogo from "@/assets/cineflex-logo.png";

const PLANS = [
  { days: 7, price: "5,99", label: "7 dias", highlight: false },
  { days: 15, price: "11,99", label: "15 dias", highlight: true },
  { days: 30, price: "21,99", label: "30 dias", highlight: false },
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

  const [paymentId, setPaymentId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get("payment_id");
    const status = params.get("collection_status");

    if (!pid) return;

    // Se o usuário voltou sem pagar (status === null ou 'null' do MP), não inicia polling
    if (status === "null" || status === null) {
      window.history.replaceState({}, "", window.location.pathname);
      return;
    }

    // Limpa URL imediatamente para evitar re-trigger em remount
    window.history.replaceState({}, "", window.location.pathname);
    setPaymentId(pid);
    setPollingPayment(true);
  }, []);

  useEffect(() => {
    if (!paymentId) return;

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
      } else if (attempts > 30) {
        setPollingPayment(false);
        clearInterval(interval);
        toast({
          title: "Pagamento em processamento",
          description: "Assim que aprovado, seu PIN será liberado.",
        });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [paymentId]);

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
    <div className="relative min-h-screen w-full">
      <AnimatedBackground />
      <FeaturedLoginCarousel />

      {/* Overlay para legibilidade — mais forte para contraste */}
      <div className="fixed inset-0 z-10 bg-gradient-to-b from-black/90 via-black/85 to-black/95 pointer-events-none" />

      <div className="relative z-20 w-full max-w-7xl mx-auto px-4 py-5 sm:py-8 lg:py-10">
        {/* Header com logo */}
        <header className="flex items-center justify-between mb-6 sm:mb-8 lg:mb-10">
          <div className="flex items-center gap-2.5">
            <img
              src={cineflexLogo}
              alt="CINE FLEX"
              width={48}
              height={48}
              className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 drop-shadow-[0_0_12px_rgba(229,9,20,0.6)]"
            />
            <div>
              <h1 className="text-lg sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white leading-none">
                CINE <span className="text-netflix-red">FLEX</span>
              </h1>
              <p className="text-[9px] sm:text-xs text-netflix-gray flex items-center gap-1 mt-1">
                <Globe className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> www.cineflex.com.br
              </p>
            </div>
          </div>
          <a
            href={SUPPORT_WHATS}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 lg:px-4 lg:py-2.5 rounded-full bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm font-medium transition-all shadow-lg shadow-green-600/30"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Suporte</span>
          </a>
        </header>

        {/* PIN gerado */}
        {generatedPin && (
          <div className="mb-5 p-4 rounded-2xl bg-gradient-to-br from-green-600/40 to-emerald-700/30 border border-green-500/60 backdrop-blur-xl">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-300 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-bold text-base sm:text-lg">Pagamento aprovado!</h3>
                <p className="text-xs sm:text-sm text-white/90 mb-3">Copie seu PIN e use para entrar:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 min-w-0 px-3 py-3 rounded-lg bg-black/70 text-green-300 font-mono text-xl sm:text-2xl font-bold tracking-widest text-center truncate">
                    {generatedPin}
                  </code>
                  <Button onClick={copyPin} size="icon" variant="secondary" className="h-12 w-12 shrink-0">
                    {copied ? <CheckCircle2 className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {pollingPayment && !generatedPin && (
          <div className="mb-5 p-4 rounded-2xl bg-blue-600/30 border border-blue-500/50 backdrop-blur-xl flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-blue-200 animate-spin shrink-0" />
            <p className="text-sm text-white">Confirmando seu pagamento e gerando o PIN...</p>
          </div>
        )}

        {/* Grid principal — duas colunas em telas grandes */}
        <div className="grid lg:grid-cols-5 gap-6 lg:gap-10 items-start">
          {/* Coluna esquerda — apresentação */}
          <section className="lg:col-span-3 lg:order-1 order-2">
            <div className="text-center lg:text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-netflix-red/25 border border-netflix-red/50 text-netflix-red text-[10px] sm:text-xs font-semibold mb-4">
                <Sparkles className="w-3 h-3" /> Streaming Premium
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white leading-tight mb-3 lg:mb-4">
                Filmes, séries e <span className="text-netflix-red">TV ao vivo</span>
              </h2>
              <p className="text-netflix-gray text-sm sm:text-base lg:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0">
                {welcomeMessage || `Milhares de títulos atualizados toda semana. Acesso liberado em segundos após o pagamento.`}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4 mt-6 lg:mt-8">
              <div className="p-3 lg:p-4 rounded-xl bg-white/10 border border-white/15 backdrop-blur-sm text-center lg:text-left">
                <Film className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-netflix-red mb-1 mx-auto lg:mx-0" />
                <p className="text-base sm:text-xl lg:text-2xl font-bold text-white">{moviesCount || "..."}</p>
                <p className="text-[9px] sm:text-[10px] lg:text-xs text-netflix-gray uppercase">Filmes</p>
              </div>
              <div className="p-3 lg:p-4 rounded-xl bg-white/10 border border-white/15 backdrop-blur-sm text-center lg:text-left">
                <Tv className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-netflix-red mb-1 mx-auto lg:mx-0" />
                <p className="text-base sm:text-xl lg:text-2xl font-bold text-white">{seriesCount || "..."}</p>
                <p className="text-[9px] sm:text-[10px] lg:text-xs text-netflix-gray uppercase">Séries</p>
              </div>
              <div className="p-3 lg:p-4 rounded-xl bg-white/10 border border-white/15 backdrop-blur-sm text-center lg:text-left">
                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-netflix-red mb-1 mx-auto lg:mx-0" />
                <p className="text-base sm:text-xl lg:text-2xl font-bold text-white">100%</p>
                <p className="text-[9px] sm:text-[10px] lg:text-xs text-netflix-gray uppercase">Seguro</p>
              </div>
            </div>

            {/* Planos */}
            <section className="mt-6 lg:mt-8 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-bold text-base sm:text-lg lg:text-xl">Adquira seu token</h3>
                <span className="text-[9px] sm:text-[10px] text-netflix-gray uppercase tracking-wider">Automático</span>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
                {PLANS.map((p) => (
                  <div
                    key={p.days}
                    className={`relative p-2.5 sm:p-4 lg:p-5 rounded-xl border backdrop-blur-md transition-all flex flex-col ${
                      p.highlight
                        ? "bg-gradient-to-br from-netflix-red/40 to-netflix-red/15 border-netflix-red/70 shadow-lg shadow-netflix-red/30"
                        : "bg-white/10 border-white/15"
                    }`}
                  >
                    {p.highlight && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full bg-netflix-red text-white text-[8px] sm:text-[9px] font-bold uppercase whitespace-nowrap">
                        Popular
                      </span>
                    )}
                    <p className="text-[10px] sm:text-xs lg:text-sm text-netflix-gray mb-0.5 text-center">{p.label}</p>
                    <p className="text-base sm:text-2xl lg:text-3xl font-extrabold text-white text-center leading-tight">
                      R$<span className="text-sm sm:text-2xl lg:text-3xl">{p.price}</span>
                    </p>
                    <p className="text-[9px] sm:text-[10px] lg:text-xs text-netflix-gray mb-2 sm:mb-3 text-center">{p.days} dias</p>
                    <Button
                      onClick={() => handleBuy(p.days)}
                      disabled={buyingPlan !== null}
                      size="sm"
                      className={`w-full text-[11px] sm:text-xs lg:text-sm h-8 sm:h-9 lg:h-10 mt-auto px-1 ${
                        p.highlight
                          ? "bg-netflix-red hover:bg-red-700"
                          : "bg-white/15 hover:bg-white/25 text-white"
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
                className="flex items-center justify-center gap-2 w-full py-2.5 sm:py-3 rounded-xl bg-white/10 border border-white/15 hover:bg-white/20 text-xs sm:text-sm text-white transition-all"
              >
                <MessageCircle className="w-4 h-4 text-green-400" />
                Token personalizado? Fale com o suporte
              </a>
            </section>
          </section>

          {/* Coluna direita — login (sticky em desktop) */}
          <section className="lg:col-span-2 lg:order-2 order-1 lg:sticky lg:top-6">
            <div className="relative p-5 sm:p-7 lg:p-8 rounded-2xl bg-gradient-to-br from-netflix-red/25 via-black/90 to-black/90 border-2 border-netflix-red/50 backdrop-blur-xl shadow-2xl shadow-netflix-red/30">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-full bg-netflix-red/25 border border-netflix-red/50 flex items-center justify-center">
                  <LogIn className="w-4 h-4 lg:w-5 lg:h-5 text-netflix-red" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white leading-tight">Já é assinante?</h2>
                  <p className="text-[11px] sm:text-xs lg:text-sm text-netflix-gray">Entre com seu PIN de acesso</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
                <Input
                  id="pin"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Digite seu PIN"
                  className="bg-white/15 border-white/25 text-white text-center text-lg tracking-[0.35em] font-mono h-12 sm:h-14 lg:h-16 flex-1 placeholder:text-white/40 placeholder:tracking-normal placeholder:font-sans"
                />
                <Button
                  type="submit"
                  className="bg-netflix-red hover:bg-red-700 h-12 sm:h-14 lg:h-16 px-8 text-base lg:text-lg font-bold shadow-lg shadow-netflix-red/40 w-full"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Entrar"}
                </Button>
              </form>
              {error && <p className="text-red-300 text-xs mt-2">{error}</p>}
              <p className="text-[10px] sm:text-xs text-netflix-gray mt-4 text-center">
                Cada PIN funciona em <strong className="text-white">1 dispositivo por vez</strong>.
              </p>
            </div>
          </section>
        </div>

        <p className="text-center text-[10px] text-netflix-gray/70 pb-4 pt-8">
          © {new Date().getFullYear()} CINE FLEX · www.cineflex.com.br
        </p>
      </div>
    </div>
  );
};

export default PinLoginForm;

