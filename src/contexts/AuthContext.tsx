import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { resolveAvatar, getAvatarId } from "@/lib/avatars";

interface AuthContextType {
  isLoggedIn: boolean;
  isAdmin: boolean;
  loading: boolean;
  profileLoaded: boolean;
  clientName: string;
  adminUsername: string;
  avatar: string;
  user: User | null;
  loginAsAdmin: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateAvatar: (url: string) => Promise<void>;
  updateDisplayName: (name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  isAdmin: false,
  loading: true,
  profileLoaded: false,
  clientName: "",
  adminUsername: "",
  avatar: "",
  user: null,
  loginAsAdmin: async () => false,
  logout: async () => {},
  updateAvatar: async () => {},
  updateDisplayName: async () => {},
});

export const useAuth = () => useContext(AuthContext);

const SESSION_ID_KEY = "cf_session_id";

const ensureSessionId = (): string => {
  let id = localStorage.getItem(SESSION_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_ID_KEY, id);
  }
  return id;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUsername, setAdminUsername] = useState("");
  const [clientName, setClientName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [loading, setLoading] = useState(true);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const sessionIdRef = useRef<string>(ensureSessionId());
  const claimedRef = useRef<boolean>(false);

  // Bootstrap admin from localStorage
  useEffect(() => {
    try {
      const adminRaw = localStorage.getItem("adminAuth");
      if (adminRaw) {
        const a = JSON.parse(adminRaw);
        if (a?.username && a?.expiry && new Date(a.expiry) > new Date()) {
          setIsAdmin(true);
          setAdminUsername(a.username);
          setClientName(a.username);
        } else {
          localStorage.removeItem("adminAuth");
        }
      }
    } catch { /* ignore */ }
  }, []);

  // Supabase auth listener + single-device claim
  useEffect(() => {
    const claimSession = async (uid: string) => {
      const sid = sessionIdRef.current;
      const { error } = await supabase
        .from("profiles")
        .update({ active_session_id: sid })
        .eq("id", uid);
      if (!error) claimedRef.current = true;
    };

    const loadProfile = async (uid: string) => {
      const { data } = await supabase
        .from("profiles")
        .select("display_name, avatar")
        .eq("id", uid)
        .maybeSingle();
      if (data) {
        setClientName(data.display_name || "");
        setAvatar(resolveAvatar(data.avatar || ""));
      }
      setProfileLoaded(true);
    };

    const { data: sub } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        const uid = newSession.user.id;
        // Defer to avoid deadlocks
        setTimeout(() => {
          claimSession(uid).catch(() => undefined);
          loadProfile(uid).catch(() => undefined);
        }, 0);
      } else {
        claimedRef.current = false;
        setProfileLoaded(false);
        setClientName("");
        setAvatar("");
      }
    });

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        const uid = s.user.id;
        claimSession(uid).catch(() => undefined);
        loadProfile(uid).catch(() => undefined);
      } else {
        setProfileLoaded(true);
      }
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  // Realtime: detect when another device takes over the session
  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel(`profile-${user.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles", filter: `id=eq.${user.id}` },
        (payload) => {
          // Ignore events that fire before we've successfully claimed our own session.
          if (!claimedRef.current) return;
          const remote = (payload.new as { active_session_id?: string })?.active_session_id;
          if (remote && remote !== sessionIdRef.current) {
            toast({
              title: "Sessão encerrada",
              description: "Sua conta foi acessada em outro dispositivo.",
              variant: "destructive",
            });
            supabase.auth.signOut().finally(() => {
              localStorage.removeItem(SESSION_ID_KEY);
              window.location.replace("/");
            });
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const loginAsAdmin = async (username: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc("validate_admin_credentials", {
        _username: username,
        _password: password,
      });
      if (error) throw error;
      if (data) {
        const validated = data as string;
        const expiry = new Date();
        expiry.setHours(expiry.getHours() + 24);
        localStorage.setItem("adminAuth", JSON.stringify({ username: validated, expiry: expiry.toISOString() }));
        setIsAdmin(true);
        setAdminUsername(validated);
        setClientName(validated);
        toast({ title: "Login admin efetuado", description: `Bem-vindo, ${validated}.` });
        return true;
      }
      toast({ title: "Credenciais inválidas", description: "Usuário ou senha incorretos.", variant: "destructive" });
      return false;
    } catch (err) {
      console.error(err);
      toast({ title: "Erro no login admin", variant: "destructive" });
      return false;
    }
  };

  const logout = async () => {
    if (isAdmin) {
      localStorage.removeItem("adminAuth");
      setIsAdmin(false);
      setAdminUsername("");
      setClientName("");
      window.location.replace("/admin-access");
      return;
    }
    await supabase.auth.signOut();
    localStorage.removeItem(SESSION_ID_KEY);
    window.location.replace("/");
  };

  const updateAvatar = async (value: string) => {
    if (!user) throw new Error("Não autenticado");
    const idToStore = getAvatarId(value) || value;
    const { error } = await supabase.from("profiles").update({ avatar: idToStore }).eq("id", user.id);
    if (error) throw error;
    setAvatar(resolveAvatar(idToStore));
  };

  const updateDisplayName = async (name: string) => {
    if (!user) throw new Error("Não autenticado");
    const trimmed = name.trim();
    if (!trimmed) throw new Error("Informe um nome");
    const { error } = await supabase.from("profiles").update({ display_name: trimmed }).eq("id", user.id);
    if (error) throw error;
    setClientName(trimmed);
  };

  const isLoggedIn = isAdmin || !!session;

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        isAdmin,
        loading,
        clientName,
        adminUsername,
        avatar,
        user,
        loginAsAdmin,
        logout,
        updateAvatar,
        updateDisplayName,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
