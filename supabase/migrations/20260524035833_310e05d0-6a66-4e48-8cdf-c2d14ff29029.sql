
-- Prevent duplicate credit for the same Stripe session
CREATE UNIQUE INDEX IF NOT EXISTS wallet_transactions_kind_reference_unique
  ON public.wallet_transactions(kind, reference)
  WHERE reference IS NOT NULL;

CREATE OR REPLACE FUNCTION public.credit_coins_from_payment(
  _user_id uuid,
  _amount integer,
  _reference text
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _new_balance INTEGER;
  _existing INTEGER;
BEGIN
  IF _user_id IS NULL THEN RAISE EXCEPTION 'user_id required'; END IF;
  IF _amount IS NULL OR _amount <= 0 THEN RAISE EXCEPTION 'invalid amount'; END IF;
  IF _reference IS NULL OR length(_reference) = 0 THEN RAISE EXCEPTION 'reference required'; END IF;

  -- Idempotency: if we already processed this payment session, return current balance
  SELECT 1 INTO _existing
  FROM public.wallet_transactions
  WHERE kind = 'stripe_purchase' AND reference = _reference
  LIMIT 1;

  IF _existing IS NOT NULL THEN
    SELECT COALESCE(balance, 0) INTO _new_balance FROM public.wallets WHERE user_id = _user_id;
    RETURN COALESCE(_new_balance, 0);
  END IF;

  INSERT INTO public.wallets (user_id, balance) VALUES (_user_id, _amount)
  ON CONFLICT (user_id) DO UPDATE SET balance = public.wallets.balance + EXCLUDED.balance
  RETURNING balance INTO _new_balance;

  INSERT INTO public.wallet_transactions (user_id, amount, kind, reference)
  VALUES (_user_id, _amount, 'stripe_purchase', _reference);

  RETURN _new_balance;
END;
$$;
