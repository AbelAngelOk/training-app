-- Bug found during Fase 2 admin verification: getProgramAssignmentCount()
-- (used to block hard-deleting a program/challenge that users have assigned,
-- since workout_program_id on user_programs is ON DELETE CASCADE and would
-- silently wipe their assignment history) queried user_programs as the
-- admin's own JWT, but the only existing SELECT policy is
-- USING (auth.uid() = user_id) — admins could not see other users' rows,
-- so the safety check always returned 0 regardless of real usage.
--
-- Additive: Postgres OR's multiple permissive policies for the same
-- command/role together, so this does not change what a non-admin can see.
CREATE POLICY "user_programs: admin select"
  ON public.user_programs FOR SELECT TO authenticated
  USING (public.is_admin());
