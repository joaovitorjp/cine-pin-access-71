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

type ClaimedProfile = {
  display_name: string | null;
  avatar: string | null;
  active_session_id: string | null;
};

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
  const activeUserRef = useRef<string>("");
  const profileRequestRef = useRef<Promise<void> | null>(null);

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
    let cancelled = false;

    const displayNameFromUser = (authUser: User) =>
      authUser.user_metadata?.display_name ||
      authUser.user_metadata?.full_name ||
      authUser.email?.split("@")[0] ||
      "";

    const resetProfileState = () => {
      claimedRef.current = false;
      activeUserRef.current = "";
      profileRequestRef.current = null;
      setProfileLoaded(false);
      setClientName("");
      setAvatar("");
    };

    const claimAndLoadProfile = async (authSession: Session) => {
      const uid = authSession.user.id;
      if (activeUserRef.current === uid && claimedRef.current) return;
      if (profileRequestRef.current) return profileRequestRef.current;

      activeUserRef.current = uid;
      setProfileLoaded(false);

      const request = (async () => {
        const sid = sessionIdRef.current;
        const { data, error } = await (supabase.rpc as any)("claim_user_session", { _session_id: sid });

        let profile: ClaimedProfile | null = (data as ClaimedProfile[] | null)?.[0] ?? null;


        if (error) {
          const fallbackName = displayNameFromUser(authSession.user);
          await supabase.from("profiles").upsert(
            { id: uid, display_name: fallbackName, active_session_id: sid },
            { onConflict: "id" }
          );
          const { data: fallback } = await supabase
            .from("profiles")
            .select("display_name, avatar, active_session_id")
            .eq("id", uid)
            .maybeSingle();
          profile = fallback ?? null;
        }

        if (cancelled || activeUserRef.current !== uid) return;

        claimedRef.current = true;
        setClientName(profile?.display_name || displayNameFromUser(authSession.user));
        setAvatar(resolveAvatar(profile?.avatar || ""));
        setProfileLoaded(true);
      })()
        .catch((error) => {
          console.error("Erro ao carregar perfil:", error);
          if (!cancelled && activeUserRef.current === uid) {
            setClientName(displayNameFromUser(authSession.user));
            setAvatar("");
            setProfileLoaded(true);
          }
        })
        .finally(() => {
          if (profileRequestRef.current === request) profileRequestRef.current = null;
        });

      profileRequestRef.current = request;
      return request;
    };

    const applySession = (newSession: Session | null) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        setLoading(false);
        claimAndLoadProfile(newSession).catch(() => undefined);
      } else {
        resetProfileState();
        setLoading(false);
        setProfileLoaded(true);
      }
    };

    const { data: sub } = supabase.auth.onAuthStateChange((event, newSession) => {
      // Only react to genuine sign-out / sign-in transitions.
      // TOKEN_REFRESHED / USER_UPDATED / INITIAL_SESSION just update tokens silently —
      // re-running claim_user_session on every refresh causes RPC storms and 429s.
      if (event === "SIGNED_OUT") {
        applySession(null);
        return;
      }
      if (event === "SIGNED_IN") {
        setTimeout(() => applySession(newSession), 0);
        return;
      }
      // For TOKEN_REFRESHED / USER_UPDATED: just keep session/user in sync, no DB work.
      if (newSession) {
        setSession(newSession);
        setUser(newSession.user);
      }
    });

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (cancelled) return;
      applySession(s);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  // Realtime: detect when another device takes over the session
  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel(`profile-${user.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles", filter: `id=eq.${user.id}` },
        async (payload) => {
          // Ignore avatar/name updates and events that fire before our own claim is stable.
          if (!claimedRef.current) return;
          const previous = (payload.old as { active_session_id?: string | null })?.active_session_id;
          const remote = (payload.new as { active_session_id?: string | null })?.active_session_id;
          if (!remote || remote === sessionIdRef.current || remote === previous) return;

          const { data } = await supabase
            .from("profiles")
            .select("active_session_id")
            .eq("id", user.id)
            .maybeSingle();

          if (data?.active_session_id && data.active_session_id !== sessionIdRef.current) {
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
    const { data, error } = await supabase
      .from("profiles")
      .update({ avatar: idToStore })
      .eq("id", user.id)
      .select("avatar")
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      const { error: upsertError } = await supabase
        .from("profiles")
        .upsert({ id: user.id, display_name: clientName || user.email?.split("@")[0] || "", avatar: idToStore }, { onConflict: "id" });
      if (upsertError) throw upsertError;
    }
    setAvatar(resolveAvatar(data?.avatar || idToStore));
    setProfileLoaded(true);
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
        profileLoaded: isAdmin ? true : profileLoaded,
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
