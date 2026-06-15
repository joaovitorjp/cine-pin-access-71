DROP FUNCTION IF EXISTS public.add_coins(integer);
DROP FUNCTION IF EXISTS public.unlock_movie(text);
DROP FUNCTION IF EXISTS public.credit_coins_from_payment(uuid, integer, text);
DROP FUNCTION IF EXISTS public.get_payment_pin(uuid);
DROP TABLE IF EXISTS public.movie_unlocks CASCADE;
DROP TABLE IF EXISTS public.wallet_transactions CASCADE;
DROP TABLE IF EXISTS public.wallets CASCADE;