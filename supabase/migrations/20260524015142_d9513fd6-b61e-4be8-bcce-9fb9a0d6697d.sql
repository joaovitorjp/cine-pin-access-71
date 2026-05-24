-- 1) Reforçar set_admin_password: exigir senha atual
CREATE OR REPLACE FUNCTION public.set_admin_password(_username text, _current_password text, _new_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $function$
DECLARE
  _rows int;
  _ok text;
BEGIN
  IF _new_password IS NULL OR length(_new_password) < 6 THEN
    RAISE EXCEPTION 'Password must be at least 6 characters';
  END IF;

  -- Verifica credenciais atuais antes de permitir troca
  SELECT username INTO _ok
  FROM public.admin_users
  WHERE username = _username
    AND active = true
    AND password_hash = extensions.crypt(_current_password, password_hash)
  LIMIT 1;

  IF _ok IS NULL THEN
    RETURN false;
  END IF;

  UPDATE public.admin_users
  SET password_hash = extensions.crypt(_new_password, extensions.gen_salt('bf', 10))
  WHERE username = _username;

  GET DIAGNOSTICS _rows = ROW_COUNT;
  RETURN _rows > 0;
END;
$function$;

-- Remove a assinatura antiga (2 args) para que ninguém possa mais chamá-la
DROP FUNCTION IF EXISTS public.set_admin_password(text, text);

-- 2) Restringir EXECUTE: revoga de PUBLIC e concede explicitamente
REVOKE ALL ON FUNCTION public.set_admin_password(text, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_admin_password(text, text, text) TO authenticated, service_role;

-- Login admin precisa continuar acessível para anon (fluxo pré-autenticação)
REVOKE ALL ON FUNCTION public.validate_admin_token(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.validate_admin_token(text) TO anon, authenticated, service_role;

REVOKE ALL ON FUNCTION public.validate_admin_credentials(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.validate_admin_credentials(text, text) TO anon, authenticated, service_role;

-- get_payment_pin precisa continuar acessível para anon (retorno do Mercado Pago)
REVOKE ALL ON FUNCTION public.get_payment_pin(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_payment_pin(uuid) TO anon, authenticated, service_role;