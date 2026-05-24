
-- Wallets
CREATE TABLE public.wallets (
  user_id UUID NOT NULL PRIMARY KEY,
  balance INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT wallets_balance_nonneg CHECK (balance >= 0)
);
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own wallet" ON public.wallets
  FOR SELECT USING (auth.uid() = user_id);

CREATE TRIGGER update_wallets_updated_at
BEFORE UPDATE ON public.wallets
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Movie unlocks
CREATE TABLE public.movie_unlocks (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  movie_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, movie_id)
);
ALTER TABLE public.movie_unlocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own unlocks" ON public.movie_unlocks
  FOR SELECT USING (auth.uid() = user_id);

-- Wallet transactions log (optional but useful)
CREATE TABLE public.wallet_transactions (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  amount INTEGER NOT NULL,
  kind TEXT NOT NULL,
  reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own transactions" ON public.wallet_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Add coins
CREATE OR REPLACE FUNCTION public.add_coins(_amount INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid UUID := auth.uid();
  _new_balance INTEGER;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF _amount IS NULL OR _amount <= 0 THEN RAISE EXCEPTION 'Invalid amount'; END IF;

  INSERT INTO public.wallets (user_id, balance) VALUES (_uid, _amount)
  ON CONFLICT (user_id) DO UPDATE SET balance = public.wallets.balance + EXCLUDED.balance
  RETURNING balance INTO _new_balance;

  INSERT INTO public.wallet_transactions (user_id, amount, kind)
  VALUES (_uid, _amount, 'purchase');

  RETURN _new_balance;
END;
$$;

-- Unlock movie spending 1 coin (idempotent: if already unlocked, no charge)
CREATE OR REPLACE FUNCTION public.unlock_movie(_movie_id TEXT)
RETURNS TABLE(unlocked BOOLEAN, balance INTEGER, already BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid UUID := auth.uid();
  _current INTEGER;
  _exists BOOLEAN;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF _movie_id IS NULL OR length(_movie_id) = 0 THEN RAISE EXCEPTION 'Invalid movie'; END IF;

  SELECT EXISTS(SELECT 1 FROM public.movie_unlocks WHERE user_id = _uid AND movie_id = _movie_id) INTO _exists;
  IF _exists THEN
    SELECT COALESCE((SELECT balance FROM public.wallets WHERE user_id = _uid), 0) INTO _current;
    RETURN QUERY SELECT true, _current, true;
    RETURN;
  END IF;

  UPDATE public.wallets SET balance = balance - 1
  WHERE user_id = _uid AND balance >= 1
  RETURNING balance INTO _current;

  IF _current IS NULL THEN
    SELECT COALESCE((SELECT balance FROM public.wallets WHERE user_id = _uid), 0) INTO _current;
    RETURN QUERY SELECT false, _current, false;
    RETURN;
  END IF;

  INSERT INTO public.movie_unlocks (user_id, movie_id) VALUES (_uid, _movie_id)
  ON CONFLICT DO NOTHING;

  INSERT INTO public.wallet_transactions (user_id, amount, kind, reference)
  VALUES (_uid, -1, 'unlock_movie', _movie_id);

  RETURN QUERY SELECT true, _current, false;
END;
$$;
