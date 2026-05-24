import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Lock,
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowLeft,
  KeyRound,
  User as UserIcon,
  Sparkles,
  Activity,
  Cpu,
} from "lucide-react";
import cineflexLogo from "@/assets/cineflex-logo.png";

/**
 * Hidden route: /admin-access
 * Modern split-layout admin login — Netflix red/black theme.
 */
const AdminAccess: React.FC = () => {
  const navigate = useNavigate();
  const { loginAsAdmin, isAdmin } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAdmin) navigate("/admin", { replace: true });
  }, [isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password.trim()) {
      setError("Informe usuário e senha.");
      return;
    }
    setLoading(true);
    const ok = await loginAsAdmin(username.trim(), password);
    setLoading(false);
    if (ok) navigate("/admin", { replace: true });
    else setError("Usuário ou senha incorretos.");
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white">
      {/* Ambient background — red glows on black */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 w-[560px] h-[560px] rounded-full bg-netflix-red/30 blur-[140px] animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-red-700/25 blur-[160px]" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[420px] h-[420px] rounded-full bg-red-500/10 blur-[140px]" />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
            maskImage:
              "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          }}
        />
      </div>

      {/* Back link */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-4 left-4 z-20 inline-flex items-center gap-2 text-xs text-white/60 hover:text-white transition-colors backdrop-blur-md bg-white/5 border border-white/10 rounded-full px-3 py-1.5"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Voltar ao site
      </button>

      <div className="relative z-10 min-h-screen w-full grid lg:grid-cols-2">
        {/* LEFT — brand panel */}
        <aside className="hidden lg:flex flex-col justify-between p-12 xl:p-16 relative overflow-hidden">
          <div className="flex items-center gap-3">
            <img
              src={cineflexLogo}
              alt="CINE FLEX"
              className="w-12 h-12 drop-shadow-[0_0_18px_rgba(229,9,20,0.55)]"
            />
            <div>
              <p className="text-base font-extrabold tracking-tight">
                CINE <span className="text-netflix-red">FLEX</span>
              </p>
              <p className="text-[11px] text-white/40 uppercase tracking-[0.2em]">
                Control Center
              </p>
            </div>
          </div>

          <div className="space-y-8 max-w-lg">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-red-200/90 bg-netflix-red/15 border border-netflix-red/30 rounded-full px-2.5 py-1 mb-5">
                <Sparkles className="w-3 h-3" />
                Painel administrativo
              </div>
              <h2 className="text-4xl xl:text-5xl font-semibold tracking-tight leading-[1.05]">
                Gerencie tudo
                <br />
                <span className="bg-gradient-to-r from-red-400 via-netflix-red to-red-600 bg-clip-text text-transparent">
                  em um só lugar.
                </span>
              </h2>
              <p className="mt-4 text-white/55 text-sm leading-relaxed">
                Conteúdo, usuários, banners e métricas — uma experiência unificada,
                rápida e segura para administradores.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Activity, label: "Estatísticas", hint: "em tempo real" },
                { icon: Cpu, label: "Gestão", hint: "filmes, séries, TV" },
                { icon: Lock, label: "Acesso", hint: "criptografado" },
                { icon: ShieldCheck, label: "Auditoria", hint: "monitorada" },
              ].map((f) => (
                <div
                  key={f.label}
                  className="group rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-3 hover:bg-white/[0.06] hover:border-netflix-red/40 transition-colors"
                >
                  <f.icon className="w-4 h-4 text-netflix-red mb-2" />
                  <p className="text-xs font-medium">{f.label}</p>
                  <p className="text-[11px] text-white/40">{f.hint}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-white/30">
            © {new Date().getFullYear()} CINE FLEX · Área restrita
          </p>
        </aside>

        {/* RIGHT — form */}
        <main className="flex items-center justify-center px-4 py-10 sm:px-8">
          <div className="relative w-full max-w-md">
            <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-netflix-red/40 via-white/5 to-red-900/30 opacity-70 blur" />
            <div className="relative rounded-3xl border border-white/10 bg-black/60 backdrop-blur-2xl shadow-[0_30px_100px_-30px_rgba(229,9,20,0.35)] p-7 sm:p-10">
              {/* Mobile brand */}
              <div className="lg:hidden flex flex-col items-center text-center mb-6">
                <img
                  src={cineflexLogo}
                  alt="CINE FLEX"
                  className="w-16 h-16 mb-3 drop-shadow-[0_0_18px_rgba(229,9,20,0.55)]"
                />
                <p className="text-lg font-extrabold tracking-tight">
                  CINE <span className="text-netflix-red">FLEX</span>
                </p>
                <p className="text-[11px] uppercase tracking-[0.25em] text-white/40 mt-0.5">
                  Control Center
                </p>
              </div>

              <div className="mb-7">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-netflix-red to-red-700 flex items-center justify-center shadow-lg shadow-netflix-red/30">
                    <ShieldCheck className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-semibold tracking-tight leading-none">
                      Acesso administrativo
                    </h1>
                    <p className="text-xs text-white/50 mt-1">
                      Entre com suas credenciais para continuar.
                    </p>
                  </div>
                </div>
                <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-emerald-300/90 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-2.5 py-1">
                  <Lock className="w-3 h-3" />
                  Conexão segura · TLS
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="admin-username" className="text-white/80 text-xs font-medium">
                    Usuário
                  </Label>
                  <div className="relative group">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-netflix-red transition-colors" />
                    <Input
                      id="admin-username"
                      type="text"
                      autoComplete="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="seu.usuario"
                      autoFocus
                      className="h-12 pl-9 bg-white/[0.04] border-white/10 text-white placeholder:text-white/30 focus-visible:ring-2 focus-visible:ring-netflix-red/60 focus-visible:border-netflix-red/50 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-password" className="text-white/80 text-xs font-medium">
                    Senha
                  </Label>
                  <div className="relative group">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-netflix-red transition-colors" />
                    <Input
                      id="admin-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="h-12 pl-9 pr-10 bg-white/[0.04] border-white/10 text-white placeholder:text-white/30 focus-visible:ring-2 focus-visible:ring-netflix-red/60 focus-visible:border-netflix-red/50 rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-white/40 hover:text-white/80"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2.5">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-netflix-red to-red-700 hover:from-red-600 hover:to-red-800 text-white font-semibold shadow-lg shadow-netflix-red/30 border-0 transition-all"
                >
                  {loading ? "Verificando..." : "Acessar painel"}
                </Button>
              </form>

              <div className="mt-7 pt-5 border-t border-white/10 flex items-center justify-between gap-3">
                <p className="text-[11px] text-white/40">
                  Acesso monitorado · Apenas autorizados
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] text-emerald-300/80">online</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminAccess;
