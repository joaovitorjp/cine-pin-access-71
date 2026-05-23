-- 1. Remove plaintext password column
ALTER TABLE public.admin_users DROP COLUMN IF EXISTS password;

-- 2. Drop overly permissive payments SELECT policy
DROP POLICY IF EXISTS "Anyone can read payment by id" ON public.payments;

-- 3. Secure function to fetch payment status/pin by id
CREATE OR REPLACE FUNCTION public.get_payment_pin(_payment_id uuid)
RETURNS TABLE(generated_pin text, status text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT generated_pin, status
  FROM public.payments
  WHERE id = _payment_id
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_payment_pin(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_payment_pin(uuid) TO anon, authenticated;