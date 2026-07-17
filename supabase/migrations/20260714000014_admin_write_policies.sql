-- =============================================================================
-- Migration: admin write policies
-- Grants role='admin' users INSERT/UPDATE/DELETE on the content tables the
-- new web dashboard manages. Split by command (not FOR ALL) so the existing,
-- already-correct SELECT policies on these tables are left untouched.
-- =============================================================================

-- exercises
CREATE POLICY "exercises: admin insert" ON public.exercises FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "exercises: admin update" ON public.exercises FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "exercises: admin delete" ON public.exercises FOR DELETE TO authenticated USING (public.is_admin());

-- muscle_groups
CREATE POLICY "muscle_groups: admin insert" ON public.muscle_groups FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "muscle_groups: admin update" ON public.muscle_groups FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "muscle_groups: admin delete" ON public.muscle_groups FOR DELETE TO authenticated USING (public.is_admin());

-- equipment
CREATE POLICY "equipment: admin insert" ON public.equipment FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "equipment: admin update" ON public.equipment FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "equipment: admin delete" ON public.equipment FOR DELETE TO authenticated USING (public.is_admin());

-- achievements
CREATE POLICY "achievements: admin insert" ON public.achievements FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "achievements: admin update" ON public.achievements FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "achievements: admin delete" ON public.achievements FOR DELETE TO authenticated USING (public.is_admin());

-- workout_programs (official + challenge; personal-own already covered by existing policies)
CREATE POLICY "workout_programs: admin insert" ON public.workout_programs FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "workout_programs: admin update" ON public.workout_programs FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "workout_programs: admin delete" ON public.workout_programs FOR DELETE TO authenticated USING (public.is_admin());

-- training_sessions
CREATE POLICY "training_sessions: admin insert" ON public.training_sessions FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "training_sessions: admin update" ON public.training_sessions FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "training_sessions: admin delete" ON public.training_sessions FOR DELETE TO authenticated USING (public.is_admin());

-- session_exercises
CREATE POLICY "session_exercises: admin insert" ON public.session_exercises FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "session_exercises: admin update" ON public.session_exercises FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "session_exercises: admin delete" ON public.session_exercises FOR DELETE TO authenticated USING (public.is_admin());

-- program_days (associate/disassociate a session with a program/challenge day)
CREATE POLICY "program_days: admin insert" ON public.program_days FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "program_days: admin update" ON public.program_days FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "program_days: admin delete" ON public.program_days FOR DELETE TO authenticated USING (public.is_admin());
