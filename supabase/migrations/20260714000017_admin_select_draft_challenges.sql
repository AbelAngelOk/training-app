-- Fase 3 prep: unlike "workout_programs: select official" (no status filter
-- at all), "workout_programs: select challenges" only allowed status =
-- 'published' rows to be selected — even for admins. That would silently
-- hide draft/archived challenges from the admin dashboard's own listing,
-- defeating the point of having a status workflow for them.
DROP POLICY "workout_programs: select challenges" ON public.workout_programs;
CREATE POLICY "workout_programs: select challenges"
  ON public.workout_programs FOR SELECT TO authenticated
  USING (type = 'challenge' AND (status = 'published' OR public.is_admin()));
