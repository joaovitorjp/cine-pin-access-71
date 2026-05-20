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
import {
  Loader2, MessageCircle, ShieldCheck, Sparkles, Tv, Film, Copy, CheckCircle2,
  Globe, LogIn, ShoppingCart, Zap, Smartphone, Cast, HeartHandshake, Star,
  CreditCard, Clock, Users,
} from "lucide-react";
import cineflexLogo from "@/assets/cineflex-logo.png";

const PLANS = [
  { days: 7, price: "5,99", label: "7 dias", highlight: false },
  { days: 15, price: "11,99", label: "15 dias", highlight: true },
  { days: 30, price: "21,99", label: "30 dias", highlight: false },
];

const SUPPORT_WHATS = "https://wa.me/5566984640346?text=Olá!%20Gostaria%20de%20um%20token%20personalizado%20para%20o%20CINE%20FLEX.";

// Classes utilitárias glass reutilizáveis
const GLASS = "bg-white/5 border border-white/10 backdrop-blur-xl";
const GLASS_HOVER = "hover:bg-white/10 hover:border-white/20";

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
    if (status === "null" || status === null) {
      window.history.replaceState({}, "", window.location.pathname);
      return;
    }
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

  const scrollToPlans = () => {
    document.getElementById("planos")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="relative min-h-screen w-full">
      <AnimatedBackground />
      <FeaturedLoginCarousel />

      {/* Overlay glass — mais suave, sem dominância vermelha */}
      <div className="fixed inset-0 z-10 bg-gradient-to-b from-black/75 via-black/70 to-black/85 pointer-events-none" />

      <div className="relative z-20 w-full max-w-7xl mx-auto px-4 py-5 sm:py-8 lg:py-10">
        {/* Header */}
        <header className="flex items-center justify-between mb-6 sm:mb-8 lg:mb-10">
          <div className="flex items-center gap-2.5">
            <img
              src={cineflexLogo}
              alt="CINE FLEX"
              width={48}
              height={48}
              className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 drop-shadow-[0_0_12px_rgba(255,255,255,0.25)]"
            />
            <div>
              <h1 className="text-lg sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white leading-none">
                CINE <span className="text-netflix-red">FLEX</span>
              </h1>
              <p className="text-[9px] sm:text-xs text-white/60 flex items-center gap-1 mt-1">
                <Globe className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> www.cineflex.com.br
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={scrollToPlans}
              size="sm"
              className={`${GLASS} ${GLASS_HOVER} text-white text-xs sm:text-sm h-9 lg:h-10 px-3 lg:px-4 rounded-full`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden xs:inline sm:inline">Comprar</span>
            </Button>
            <a
              href={SUPPORT_WHATS}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1.5 px-3 py-2 lg:px-4 lg:py-2.5 rounded-full ${GLASS} ${GLASS_HOVER} text-white text-xs sm:text-sm font-medium transition-all`}
            >
              <MessageCircle className="w-4 h-4 text-green-400" />
              <span className="hidden sm:inline">Suporte</span>
            </a>
          </div>
        </header>

        {/* PIN gerado */}
        {generatedPin && (
          <div className={`mb-5 p-4 rounded-2xl ${GLASS} ring-1 ring-green-400/30`}>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-300 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-bold text-base sm:text-lg">Pagamento aprovado!</h3>
                <p className="text-xs sm:text-sm text-white/80 mb-3">Copie seu PIN e use para entrar:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 min-w-0 px-3 py-3 rounded-lg bg-black/60 text-green-300 font-mono text-xl sm:text-2xl font-bold tracking-widest text-center truncate">
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
          <div className={`mb-5 p-4 rounded-2xl ${GLASS} flex items-center gap-3`}>
            <Loader2 className="w-5 h-5 text-white/80 animate-spin shrink-0" />
            <p className="text-sm text-white">Confirmando seu pagamento e gerando o PIN...</p>
          </div>
        )}

        {/* Hero + Login lado a lado em desktop */}
        <div className="grid lg:grid-cols-5 gap-6 lg:gap-10 items-start">
          {/* Coluna esquerda — apresentação */}
          <section className="lg:col-span-3 lg:order-1 order-2">
            <div className="text-center lg:text-left">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${GLASS} text-white/90 text-[10px] sm:text-xs font-semibold mb-4`}>
                <Sparkles className="w-3 h-3 text-netflix-red" /> Streaming Premium
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white leading-tight mb-3 lg:mb-4">
                Filmes, séries e <span className="text-white/90">TV ao vivo</span>
              </h2>
              <p className="text-white/70 text-sm sm:text-base lg:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0">
                {welcomeMessage || `Milhares de títulos atualizados toda semana. Acesso liberado em segundos após o pagamento.`}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4 mt-6 lg:mt-8">
              {[
                { Icon: Film, value: moviesCount || "...", label: "Filmes" },
                { Icon: Tv, value: seriesCount || "...", label: "Séries" },
                { Icon: ShieldCheck, value: "100%", label: "Seguro" },
              ].map(({ Icon, value, label }) => (
                <div key={label} className={`p-3 lg:p-4 rounded-xl ${GLASS} text-center lg:text-left`}>
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white/80 mb-1 mx-auto lg:mx-0" />
                  <p className="text-base sm:text-xl lg:text-2xl font-bold text-white">{value}</p>
                  <p className="text-[9px] sm:text-[10px] lg:text-xs text-white/60 uppercase">{label}</p>
                </div>
              ))}
            </div>

            {/* CTA Comprar */}
            <div className="mt-6 lg:mt-8">
              <Button
                onClick={scrollToPlans}
                className={`w-full ${GLASS} ${GLASS_HOVER} text-white h-12 lg:h-14 text-sm lg:text-base font-semibold rounded-xl`}
              >
                <ShoppingCart className="w-5 h-5" />
                Ver planos e comprar agora
              </Button>
            </div>
          </section>

          {/* Coluna direita — login glass */}
          <section className="lg:col-span-2 lg:order-2 order-1 lg:sticky lg:top-6">
            <div className={`relative p-5 sm:p-7 lg:p-8 rounded-2xl ${GLASS} shadow-2xl`}>
              <div className="flex items-center gap-2 mb-5">
                <div className={`w-10 h-10 lg:w-11 lg:h-11 rounded-full ${GLASS} flex items-center justify-center`}>
                  <LogIn className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white leading-tight">Já é assinante?</h2>
                  <p className="text-[11px] sm:text-xs lg:text-sm text-white/60">Entre com seu PIN de acesso</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
                <Input
                  id="pin"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Digite seu PIN"
                  className="bg-white/5 border-white/15 text-white text-center text-lg tracking-[0.35em] font-mono h-12 sm:h-14 lg:h-16 placeholder:text-white/30 placeholder:tracking-normal placeholder:font-sans backdrop-blur-md"
                />
                <Button
                  type="submit"
                  className="bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md h-12 sm:h-14 lg:h-16 px-8 text-base lg:text-lg font-bold text-white w-full"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Entrar"}
                </Button>
              </form>
              {error && <p className="text-red-300 text-xs mt-2">{error}</p>}
              <p className="text-[10px] sm:text-xs text-white/60 mt-4 text-center">
                Cada PIN funciona em <strong className="text-white">1 dispositivo por vez</strong>.
              </p>
            </div>
          </section>
        </div>

        {/* === SEÇÕES INFORMATIVAS === */}

        {/* Benefícios */}
        <section className="mt-14 lg:mt-20">
          <div className="text-center mb-6 lg:mb-10">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${GLASS} text-white/80 text-[10px] sm:text-xs font-semibold mb-3`}>
              <Star className="w-3 h-3" /> Por que escolher
            </span>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white">
              Tudo que você precisa em um só lugar
            </h3>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[
              { Icon: Zap, title: "Acesso instantâneo", desc: "Liberação imediata após pagamento aprovado." },
              { Icon: Smartphone, title: "Multiplataforma", desc: "Assista no celular, tablet, PC ou TV." },
              { Icon: Cast, title: "Qualidade HD", desc: "Stream estável com transmissão otimizada." },
              { Icon: HeartHandshake, title: "Suporte humano", desc: "Atendimento via WhatsApp todos os dias." },
            ].map(({ Icon, title, desc }) => (
              <div key={title} className={`p-4 lg:p-5 rounded-2xl ${GLASS} ${GLASS_HOVER} transition-all`}>
                <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl ${GLASS} flex items-center justify-center mb-3`}>
                  <Icon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                </div>
                <h4 className="text-white font-bold text-sm lg:text-base mb-1">{title}</h4>
                <p className="text-white/60 text-xs lg:text-sm leading-snug">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Como funciona */}
        <section className="mt-14 lg:mt-20">
          <div className="text-center mb-6 lg:mb-10">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${GLASS} text-white/80 text-[10px] sm:text-xs font-semibold mb-3`}>
              <Clock className="w-3 h-3" /> Em 3 passos
            </span>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white">
              Como funciona
            </h3>
          </div>
          <div className="grid sm:grid-cols-3 gap-3 sm:gap-4">
            {[
              { n: "01", Icon: CreditCard, title: "Escolha um plano", desc: "Selecione a duração que faz sentido para você." },
              { n: "02", Icon: ShieldCheck, title: "Pague com segurança", desc: "Mercado Pago: PIX, cartão ou boleto." },
              { n: "03", Icon: LogIn, title: "Receba seu PIN", desc: "Use o PIN para liberar todo o catálogo." },
            ].map(({ n, Icon, title, desc }) => (
              <div key={n} className={`relative p-5 lg:p-6 rounded-2xl ${GLASS}`}>
                <span className="absolute top-4 right-5 text-3xl lg:text-4xl font-extrabold text-white/10">{n}</span>
                <Icon className="w-6 h-6 lg:w-7 lg:h-7 text-white mb-3" />
                <h4 className="text-white font-bold text-base lg:text-lg mb-1">{title}</h4>
                <p className="text-white/60 text-xs lg:text-sm leading-snug">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Depoimentos */}
        <section className="mt-14 lg:mt-20">
          <div className="text-center mb-6 lg:mb-10">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${GLASS} text-white/80 text-[10px] sm:text-xs font-semibold mb-3`}>
              <Users className="w-3 h-3" /> Quem usa, recomenda
            </span>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white">
              Depoimentos
            </h3>
          </div>
          <div className="grid md:grid-cols-3 gap-3 sm:gap-4">
            {[
              { n: "Carlos M.", t: "Catálogo enorme e estável. Cancelei outras plataformas.", s: 5 },
              { n: "Ana P.", t: "PIN chegou na hora. Atendimento rápido pelo WhatsApp.", s: 5 },
              { n: "Rafael S.", t: "TV ao vivo funcionando muito bem. Recomendo!", s: 5 },
            ].map(({ n, t, s }) => (
              <div key={n} className={`p-5 rounded-2xl ${GLASS}`}>
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: s }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-white/80 text-sm leading-relaxed mb-3">"{t}"</p>
                <p className="text-white/60 text-xs font-semibold">— {n}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-14 lg:mt-20">
          <div className="text-center mb-6 lg:mb-10">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white">
              Perguntas frequentes
            </h3>
          </div>
          <div className="space-y-3 max-w-3xl mx-auto">
            {[
              { q: "Quanto tempo dura cada token?", a: "Você escolhe: 7, 15 ou 30 dias. Após esse período o acesso encerra." },
              { q: "Posso usar em mais de um dispositivo?", a: "Cada PIN funciona em 1 dispositivo por vez. Ao logar em outro, o anterior é desconectado." },
              { q: "O pagamento é seguro?", a: "Sim. Usamos Mercado Pago para processar pagamentos com PIX, cartão ou boleto." },
              { q: "Como recebo meu PIN?", a: "O PIN é gerado automaticamente nesta tela assim que o pagamento for aprovado." },
            ].map(({ q, a }) => (
              <details key={q} className={`group p-4 lg:p-5 rounded-2xl ${GLASS} ${GLASS_HOVER} transition-all`}>
                <summary className="flex items-center justify-between cursor-pointer list-none text-white font-semibold text-sm lg:text-base">
                  {q}
                  <span className="text-white/60 group-open:rotate-45 transition-transform text-xl">+</span>
                </summary>
                <p className="mt-2 text-white/70 text-xs lg:text-sm leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* === PLANOS (movido para o final) === */}
        <section id="planos" className="mt-14 lg:mt-20 scroll-mt-6">
          <div className="text-center mb-6 lg:mb-10">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${GLASS} text-white/90 text-[10px] sm:text-xs font-semibold mb-3`}>
              <CreditCard className="w-3 h-3" /> Comece agora
            </span>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-2">
              Adquira seu token
            </h3>
            <p className="text-white/60 text-sm lg:text-base">
              Pagamento automático · Liberação imediata
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-4 lg:gap-6 max-w-4xl mx-auto">
            {PLANS.map((p) => (
              <div
                key={p.days}
                className={`relative p-3 sm:p-5 lg:p-6 rounded-2xl backdrop-blur-xl transition-all flex flex-col ${
                  p.highlight
                    ? "bg-white/10 border-2 border-white/30 shadow-xl shadow-white/5 lg:scale-105"
                    : `${GLASS} ${GLASS_HOVER}`
                }`}
              >
                {p.highlight && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-white text-black text-[9px] sm:text-[10px] font-bold uppercase whitespace-nowrap shadow-lg">
                    ★ Popular
                  </span>
                )}
                <p className="text-[10px] sm:text-xs lg:text-sm text-white/60 mb-1 text-center uppercase tracking-wider">{p.label}</p>
                <p className="text-lg sm:text-3xl lg:text-4xl font-extrabold text-white text-center leading-tight">
                  R$<span>{p.price}</span>
                </p>
                <p className="text-[9px] sm:text-[11px] lg:text-xs text-white/50 mb-3 sm:mb-4 text-center">{p.days} dias de acesso</p>
                <Button
                  onClick={() => handleBuy(p.days)}
                  disabled={buyingPlan !== null}
                  size="sm"
                  className={`w-full text-[11px] sm:text-sm lg:text-base h-8 sm:h-10 lg:h-11 mt-auto px-1 ${
                    p.highlight
                      ? "bg-white text-black hover:bg-white/90"
                      : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
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
            className={`mt-6 flex items-center justify-center gap-2 w-full max-w-4xl mx-auto py-3 sm:py-4 rounded-2xl ${GLASS} ${GLASS_HOVER} text-xs sm:text-sm text-white transition-all`}
          >
            <MessageCircle className="w-4 h-4 text-green-400" />
            Precisa de um token personalizado? Fale com o suporte
          </a>
        </section>

        <p className="text-center text-[10px] text-white/40 pb-4 pt-12">
          © {new Date().getFullYear()} CINE FLEX · www.cineflex.com.br
        </p>
      </div>
    </div>
  );
};

export default PinLoginForm;
