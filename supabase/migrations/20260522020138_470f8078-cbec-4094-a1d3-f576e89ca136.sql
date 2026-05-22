
-- pgcrypto lives in the `extensions` schema in Supabase
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- 1) Add hash column
ALTER TABLE public.admin_users
  ADD COLUMN IF NOT EXISTS password_hash text;

-- 2) Backfill hashes from any remaining plaintext passwords
UPDATE public.admin_users
SET password_hash = extensions.crypt(password, extensions.gen_salt('bf', 10))
WHERE password_hash IS NULL
  AND password IS NOT NULL
  AND password <> '';

-- 3) Wipe plaintext column
UPDATE public.admin_users SET password = '' WHERE password IS NOT NULL AND password <> '';

-- 4) Require hash going forward
ALTER TABLE public.admin_users
  ALTER COLUMN password_hash SET NOT NULL;

-- 5) Lock the table down with RLS (no policies = no client access)
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- 6) Validation RPC compares against the hash
CREATE OR REPLACE FUNCTION public.validate_admin_credentials(_username text, _password text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $function$
  SELECT username
  FROM public.admin_users
  WHERE username = _username
    AND active = true
    AND password_hash = extensions.crypt(_password, password_hash)
  LIMIT 1;
$function$;

-- 7) Helper to set/rotate passwords safely (hashes internally)
CREATE OR REPLACE FUNCTION public.set_admin_password(_username text, _new_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $$
DECLARE
  _rows int;
BEGIN
  IF _new_password IS NULL OR length(_new_password) < 6 THEN
    RAISE EXCEPTION 'Password must be at least 6 characters';
  END IF;

  UPDATE public.admin_users
  SET password_hash = extensions.crypt(_new_password, extensions.gen_salt('bf', 10)),
      password = ''
  WHERE username = _username;

  GET DIAGNOSTICS _rows = ROW_COUNT;
  RETURN _rows > 0;
END;
$$;

REVOKE ALL ON FUNCTION public.set_admin_password(text, text) FROM PUBLIC, anon, authenticated;
