import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, Lock, User as UserIcon, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "@/components/ui/use-toast";
import FeaturedLoginCarousel from "@/components/FeaturedLoginCarousel";
import cineflexLogo from "@/assets/cineflex-logo.png";
import { z } from "zod";

const signInSchema = z.object({
  email: z.string().trim().email("Email inválido").max(255),
  password: z.string().min(6, "Mínimo 6 caracteres").max(72),
});

const signUpSchema = signInSchema.extend({
  displayName: z.string().trim().min(2, "Informe seu nome").max(60),
});

type Mode = "signin" | "signup";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden>
    <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.5-1.74 4.4-5.5 4.4-3.31 0-6-2.74-6-6.1s2.69-6.1 6-6.1c1.89 0 3.15.8 3.87 1.49l2.64-2.55C16.78 3.65 14.6 2.7 12 2.7 6.86 2.7 2.7 6.86 2.7 12s4.16 9.3 9.3 9.3c5.37 0 8.93-3.77 8.93-9.08 0-.61-.06-1.07-.14-1.52H12z"/>
  </svg>
);

const EmailAuthForm: React.FC = () => {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signin") {
        const parsed = signInSchema.safeParse({ email, password });
        if (!parsed.success) throw new Error(parsed.error.errors[0].message);
        const { error } = await supabase.auth.signInWithPassword({
          email: parsed.data.email,
          password: parsed.data.password,
        });
        if (error) {
          if (error.message.toLowerCase().includes("email not confirmed")) {
            throw new Error("Confirme seu email antes de entrar. Verifique sua caixa de entrada.");
          }
          throw new Error("Email ou senha incorretos.");
        }
      } else {
        const parsed = signUpSchema.safeParse({ email, password, displayName });
        if (!parsed.success) throw new Error(parsed.error.errors[0].message);
        const { error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: parsed.data.displayName },
          },
        });
        if (error) {
          if (error.message.toLowerCase().includes("registered")) {
            throw new Error("Este email já está cadastrado.");
          }
          throw error;
        }
        toast({
          title: "Confira seu email",
          description: "Enviamos um link para confirmar seu cadastro.",
        });
        setMode("signin");
      }
    } catch (err) {
      toast({
        title: mode === "signin" ? "Erro ao entrar" : "Erro ao cadastrar",
        description: err instanceof Error ? err.message : "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast({
          title: "Erro ao entrar com Google",
          description: result.error instanceof Error ? result.error.message : "Tente novamente.",
          variant: "destructive",
        });
        setGoogleLoading(false);
      }
    } catch (err) {
      toast({
        title: "Erro ao entrar com Google",
        description: err instanceof Error ? err.message : "Tente novamente.",
        variant: "destructive",
      });
      setGoogleLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Background dos pôsteres passando (mantido obrigatório) */}
      <FeaturedLoginCarousel />
      <div className="fixed inset-0 z-10 bg-gradient-to-b from-black/50 via-black/30 to-black/65 pointer-events-none" />

      <div className="relative z-20 w-full max-w-md px-4 py-10">
        <div className="flex flex-col items-center mb-8">
          <img src={cineflexLogo} alt="CINE FLEX" className="w-16 h-16 mb-3 drop-shadow-[0_0_18px_rgba(229,9,20,0.45)]" />
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            CINE <span className="text-netflix-red">FLEX</span>
          </h1>
          <p className="text-sm text-white/60 mt-1">Filmes, séries e TV ao vivo</p>
        </div>

        <div className="rounded-2xl border border-white/15 bg-black/50 backdrop-blur-2xl shadow-[0_25px_80px_-12px_rgba(0,0,0,0.6)] p-6 sm:p-8 ring-1 ring-white/10">
          <div className="flex gap-2 mb-6 p-1 bg-white/10 rounded-xl border border-white/10">
            <button
              type="button"
              onClick={() => setMode("signin")}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition ${
                mode === "signin" ? "bg-white text-black shadow" : "text-white/70 hover:text-white"
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition ${
                mode === "signup" ? "bg-white text-black shadow" : "text-white/70 hover:text-white"
              }`}
            >
              Criar conta
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-white/90 text-xs font-medium">Nome</Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                  <Input
                    id="name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Como devemos te chamar"
                    className="pl-10 h-12 bg-white/10 border-white/25 text-white placeholder:text-white/45 focus:border-netflix-red/80 focus:ring-1 focus:ring-netflix-red/30"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-white/80 text-xs">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="pl-10 h-12 bg-white/5 border-white/15 text-white placeholder:text-white/30"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-white/80 text-xs">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  id="password"
                  type="password"
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 h-12 bg-white/5 border-white/15 text-white placeholder:text-white/30"
                  minLength={6}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-netflix-red hover:bg-netflix-red/90 text-white font-bold text-base"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {mode === "signin" ? "Entrar" : "Criar conta"}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-[10px] uppercase tracking-wider text-white/40">ou</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <Button
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading}
            variant="outline"
            className="w-full h-12 bg-white hover:bg-white/90 text-black border-white font-semibold"
          >
            {googleLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <GoogleIcon />
                <span className="ml-2">Continuar com Google</span>
              </>
            )}
          </Button>

          <p className="text-[11px] text-white/50 text-center mt-5 leading-relaxed">
            {mode === "signup"
              ? "Ao criar a conta, você receberá um email de confirmação."
              : "Acesso liberado em 1 dispositivo por vez."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailAuthForm;
