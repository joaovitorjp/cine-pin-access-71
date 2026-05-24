
-- Explicit deny policies for client-side writes. SECURITY DEFINER functions
-- (add_coins, unlock_movie, credit_coins_from_payment) bypass these and remain the
-- only path to mutate these tables.

-- wallets
CREATE POLICY "Deny direct insert on wallets" ON public.wallets
  FOR INSERT TO authenticated, anon WITH CHECK (false);
CREATE POLICY "Deny direct update on wallets" ON public.wallets
  FOR UPDATE TO authenticated, anon USING (false);
CREATE POLICY "Deny direct delete on wallets" ON public.wallets
  FOR DELETE TO authenticated, anon USING (false);

-- wallet_transactions
CREATE POLICY "Deny direct insert on wallet_transactions" ON public.wallet_transactions
  FOR INSERT TO authenticated, anon WITH CHECK (false);
CREATE POLICY "Deny direct update on wallet_transactions" ON public.wallet_transactions
  FOR UPDATE TO authenticated, anon USING (false);
CREATE POLICY "Deny direct delete on wallet_transactions" ON public.wallet_transactions
  FOR DELETE TO authenticated, anon USING (false);

-- movie_unlocks
CREATE POLICY "Deny direct insert on movie_unlocks" ON public.movie_unlocks
  FOR INSERT TO authenticated, anon WITH CHECK (false);
CREATE POLICY "Deny direct update on movie_unlocks" ON public.movie_unlocks
  FOR UPDATE TO authenticated, anon USING (false);
CREATE POLICY "Deny direct delete on movie_unlocks" ON public.movie_unlocks
  FOR DELETE TO authenticated, anon USING (false);
