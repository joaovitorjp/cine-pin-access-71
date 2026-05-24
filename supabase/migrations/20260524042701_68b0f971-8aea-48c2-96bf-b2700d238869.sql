-- Explicit deny policies for admin_tokens (defense in depth)
CREATE POLICY "Deny select on admin_tokens" ON public.admin_tokens
  FOR SELECT TO anon, authenticated USING (false);
CREATE POLICY "Deny insert on admin_tokens" ON public.admin_tokens
  FOR INSERT TO anon, authenticated WITH CHECK (false);
CREATE POLICY "Deny update on admin_tokens" ON public.admin_tokens
  FOR UPDATE TO anon, authenticated USING (false);
CREATE POLICY "Deny delete on admin_tokens" ON public.admin_tokens
  FOR DELETE TO anon, authenticated USING (false);

-- Explicit deny policies for admin_users
CREATE POLICY "Deny select on admin_users" ON public.admin_users
  FOR SELECT TO anon, authenticated USING (false);
CREATE POLICY "Deny insert on admin_users" ON public.admin_users
  FOR INSERT TO anon, authenticated WITH CHECK (false);
CREATE POLICY "Deny update on admin_users" ON public.admin_users
  FOR UPDATE TO anon, authenticated USING (false);
CREATE POLICY "Deny delete on admin_users" ON public.admin_users
  FOR DELETE TO anon, authenticated USING (false);