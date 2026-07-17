-- =============================================================================
-- Migration: admin role helper + users self-escalation protection
-- Introduces is_admin() (mirrors the owns_workout_program/owns_training_session
-- helper pattern) and allows admins to update other users' rows (needed for
-- role management from the admin dashboard). The existing "users: update own"
-- policy (USING auth.uid() = id, no WITH CHECK) lets any user change their
-- own `role` today; once the dashboard adds a legitimate way to change OTHER
-- users' roles, self-escalation must be closed explicitly via a trigger
-- (more robust than a self-referential WITH CHECK on the same row).
-- =============================================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
  );
$$;

CREATE POLICY "users: admin update"
  ON public.users FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE OR REPLACE FUNCTION public.prevent_role_self_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role <> OLD.role AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can change user role';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_users_prevent_role_self_escalation
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.prevent_role_self_escalation();
