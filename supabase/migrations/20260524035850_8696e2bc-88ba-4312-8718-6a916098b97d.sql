
REVOKE EXECUTE ON FUNCTION public.credit_coins_from_payment(uuid, integer, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.credit_coins_from_payment(uuid, integer, text) TO service_role;
