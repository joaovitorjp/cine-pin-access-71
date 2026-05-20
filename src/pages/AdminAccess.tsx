import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Lock, ShieldCheck, Eye, EyeOff, ArrowLeft, KeyRound } from "lucide-react";

/**
 * Hidden route: /admin-access
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
    <div className="relative min-h-screen w-full overflow-hidden bg-[#05060a] text-white flex items-center justify-center px-4 py-10">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute -bottom-32 -right-32 w-[520px] h-[520px] rounded-full bg-cyan-500/15 blur-[140px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-fuchsia-500/10 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
      </div>

      {/* Back link */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-4 left-4 inline-flex items-center gap-2 text-xs text-white/60 hover:text-white transition-colors backdrop-blur-md bg-white/5 border border-white/10 rounded-full px-3 py-1.5"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Voltar ao site
      </button>

      {/* Card */}
      <div className="relative w-full max-w-md">
        <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-white/20 via-white/5 to-transparent opacity-60 blur-sm" />
        <div className="relative rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl shadow-[0_20px_80px_-20px_rgba(0,0,0,0.6)] p-7 sm:p-9">
          <div className="flex flex-col items-center text-center mb-7">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 blur-md opacity-70" />
              <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg">
                <ShieldCheck className="w-7 h-7 text-white" />
              </div>
            </div>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight">
              Painel Administrativo
            </h1>
            <p className="text-sm text-white/50 mt-1">
              Área restrita · CINE FLEX
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-emerald-300/90 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-2.5 py-1">
              <Lock className="w-3 h-3" />
              Conexão segura
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="admin-username" className="text-white/80">
                Usuário
              </Label>
              <Input
                id="admin-username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="seu.usuario"
                autoFocus
                className="h-12 bg-white/[0.04] border-white/10 text-white placeholder:text-white/30 focus-visible:ring-2 focus-visible:ring-indigo-400/60 focus-visible:border-indigo-400/40"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-password" className="text-white/80">
                Senha
              </Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-12 pl-9 pr-10 bg-white/[0.04] border-white/10 text-white placeholder:text-white/30 focus-visible:ring-2 focus-visible:ring-indigo-400/60 focus-visible:border-indigo-400/40"
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
              <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-indigo-500 to-cyan-400 hover:from-indigo-400 hover:to-cyan-300 text-white font-medium shadow-lg shadow-indigo-500/20 border-0"
            >
              {loading ? "Entrando..." : "Acessar painel"}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-white/40">
            Acesso monitorado · Apenas administradores autorizados
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminAccess;
