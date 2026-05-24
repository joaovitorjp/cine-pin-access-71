CREATE OR REPLACE FUNCTION public.claim_user_session(_session_id text)
RETURNS TABLE(display_name text, avatar text, active_session_id text)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO public.profiles (id, display_name, active_session_id)
  VALUES (
    _uid,
    COALESCE(
      auth.jwt() -> 'user_metadata' ->> 'display_name',
      auth.jwt() -> 'user_metadata' ->> 'full_name',
      split_part(auth.jwt() ->> 'email', '@', 1)
    ),
    _session_id
  )
  ON CONFLICT (id) DO UPDATE
  SET
    active_session_id = EXCLUDED.active_session_id,
    display_name = COALESCE(public.profiles.display_name, EXCLUDED.display_name),
    updated_at = now();

  RETURN QUERY
  SELECT p.display_name, p.avatar, p.active_session_id
  FROM public.profiles p
  WHERE p.id = _uid;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.claim_user_session(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.claim_user_session(text) FROM anon;
GRANT EXECUTE ON FUNCTION public.claim_user_session(text) TO authenticated;