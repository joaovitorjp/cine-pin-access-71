
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_days INTEGER NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  mp_payment_id TEXT,
  mp_preference_id TEXT,
  generated_pin TEXT,
  client_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert a pending payment"
ON public.payments FOR INSERT
WITH CHECK (status = 'pending' AND generated_pin IS NULL AND mp_payment_id IS NULL);

CREATE POLICY "Anyone can read payment by id"
ON public.payments FOR SELECT
USING (true);

CREATE INDEX idx_payments_mp_payment_id ON public.payments(mp_payment_id);
