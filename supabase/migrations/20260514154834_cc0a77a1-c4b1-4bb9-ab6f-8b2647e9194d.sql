-- Create admin_tokens table to store admin login tokens in Cloud
CREATE TABLE public.admin_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token TEXT NOT NULL UNIQUE,
  label TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_tokens ENABLE ROW LEVEL SECURITY;

-- No public read/write policies: the table is only accessed via the SECURITY DEFINER function below.

-- Security definer function to validate an admin token without exposing the table
CREATE OR REPLACE FUNCTION public.validate_admin_token(_token TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_tokens
    WHERE token = _token
      AND active = true
  );
$$;

-- Seed the requested admin token
INSERT INTO public.admin_tokens (token, label) VALUES ('36040102', 'Admin principal');