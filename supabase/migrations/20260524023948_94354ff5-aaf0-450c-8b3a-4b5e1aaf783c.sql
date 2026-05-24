REVOKE EXECUTE ON FUNCTION public.claim_user_session(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.claim_user_session(text) FROM anon;
GRANT EXECUTE ON FUNCTION public.claim_user_session(text) TO authenticated;