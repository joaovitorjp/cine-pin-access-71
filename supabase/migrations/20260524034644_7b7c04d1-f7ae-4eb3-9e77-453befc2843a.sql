
DROP FUNCTION IF EXISTS public.unlock_movie(TEXT);

CREATE OR REPLACE FUNCTION public.unlock_movie(_movie_id TEXT)
RETURNS TABLE(out_unlocked BOOLEAN, out_balance INTEGER, out_already BOOLEAN)
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

  SELECT EXISTS(SELECT 1 FROM public.movie_unlocks mu WHERE mu.user_id = _uid AND mu.movie_id = _movie_id) INTO _exists;
  IF _exists THEN
    SELECT COALESCE((SELECT w.balance FROM public.wallets w WHERE w.user_id = _uid), 0) INTO _current;
    out_unlocked := true; out_balance := _current; out_already := true;
    RETURN NEXT;
    RETURN;
  END IF;

  UPDATE public.wallets w SET balance = w.balance - 1
  WHERE w.user_id = _uid AND w.balance >= 1
  RETURNING w.balance INTO _current;

  IF _current IS NULL THEN
    SELECT COALESCE((SELECT w.balance FROM public.wallets w WHERE w.user_id = _uid), 0) INTO _current;
    out_unlocked := false; out_balance := _current; out_already := false;
    RETURN NEXT;
    RETURN;
  END IF;

  INSERT INTO public.movie_unlocks (user_id, movie_id) VALUES (_uid, _movie_id)
  ON CONFLICT DO NOTHING;

  INSERT INTO public.wallet_transactions (user_id, amount, kind, reference)
  VALUES (_uid, -1, 'unlock_movie', _movie_id);

  out_unlocked := true; out_balance := _current; out_already := false;
  RETURN NEXT;
END;
$$;
