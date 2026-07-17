-- =============================================================================
-- Migration: fix prevent_role_self_escalation to not block service_role/migrations
-- Bug found while verifying Fase 0 end-to-end: the trigger from
-- 20260714000010 blocked ANY role change unless public.is_admin() was true,
-- but is_admin() relies on auth.uid(), which is NULL outside of an
-- authenticated PostgREST/client request (service_role calls, direct SQL
-- Editor sessions, migrations). This accidentally blocked the documented
-- bootstrap step (`UPDATE users SET role='admin' WHERE email=...`) and any
-- future service_role write to `role`.
-- Fix: only enforce the block when there IS an active JWT session
-- (auth.uid() IS NOT NULL) attempting the change and that session is not
-- admin. service_role/superuser/migration contexts (auth.uid() IS NULL) are
-- already a stronger trust boundary than RLS and are left untouched.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.prevent_role_self_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role <> OLD.role AND auth.uid() IS NOT NULL AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can change user role';
  END IF;
  RETURN NEW;
END;
$$;
