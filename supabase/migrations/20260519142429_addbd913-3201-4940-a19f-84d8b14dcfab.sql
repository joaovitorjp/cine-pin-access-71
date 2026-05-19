-- Master admin users table
CREATE TABLE public.admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL UNIQUE,
  password text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
-- No policies: table is only accessed via SECURITY DEFINER function below.

-- Secure credential validation
CREATE OR REPLACE FUNCTION public.validate_admin_credentials(_username text, _password text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT username
  FROM public.admin_users
  WHERE username = _username
    AND password = _password
    AND active = true
  LIMIT 1;
$$;

-- Seed master admins
INSERT INTO public.admin_users (username, password) VALUES
  ('Adrian55', '36040102'),
  ('Armando77', '36040102')
ON CONFLICT (username) DO NOTHING;