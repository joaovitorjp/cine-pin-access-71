import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface WalletContextType {
  balance: number;
  loading: boolean;
  unlockedMovies: Set<string>;
  refresh: () => Promise<void>;
  addCoins: (amount: number) => Promise<number>;
  unlockMovie: (movieId: string) => Promise<{ unlocked: boolean; balance: number; already: boolean }>;
  isUnlocked: (movieId: string) => boolean;
}

const WalletContext = createContext<WalletContextType>({
  balance: 0,
  loading: false,
  unlockedMovies: new Set(),
  refresh: async () => {},
  addCoins: async () => 0,
  unlockMovie: async () => ({ unlocked: false, balance: 0, already: false }),
  isUnlocked: () => false,
});

export const useWallet = () => useContext(WalletContext);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin } = useAuth();
  const [balance, setBalance] = useState(0);
  const [unlockedMovies, setUnlockedMovies] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user?.id) {
      setBalance(0);
      setUnlockedMovies(new Set());
      return;
    }
    setLoading(true);
    try {
      const [{ data: w }, { data: u }] = await Promise.all([
        supabase.from("wallets").select("balance").eq("user_id", user.id).maybeSingle(),
        supabase.from("movie_unlocks").select("movie_id").eq("user_id", user.id),
      ]);
      setBalance((w as any)?.balance ?? 0);
      setUnlockedMovies(new Set(((u as any[]) || []).map((r) => r.movie_id)));
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addCoins = useCallback(async (amount: number) => {
    const { data, error } = await (supabase.rpc as any)("add_coins", { _amount: amount });
    if (error) throw error;
    const newBalance = Number(data) || 0;
    setBalance(newBalance);
    return newBalance;
  }, []);

  const unlockMovie = useCallback(async (movieId: string) => {
    const { data, error } = await (supabase.rpc as any)("unlock_movie", { _movie_id: movieId });
    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    const result = {
      unlocked: !!row?.out_unlocked,
      balance: Number(row?.out_balance) || 0,
      already: !!row?.out_already,
    };
    setBalance(result.balance);
    if (result.unlocked) {
      setUnlockedMovies((prev) => {
        const next = new Set(prev);
        next.add(movieId);
        return next;
      });
    }
    return result;
  }, []);

  const isUnlocked = useCallback(
    (movieId: string) => isAdmin || unlockedMovies.has(movieId),
    [unlockedMovies, isAdmin]
  );

  return (
    <WalletContext.Provider value={{ balance, loading, unlockedMovies, refresh, addCoins, unlockMovie, isUnlocked }}>
      {children}
    </WalletContext.Provider>
  );
};
