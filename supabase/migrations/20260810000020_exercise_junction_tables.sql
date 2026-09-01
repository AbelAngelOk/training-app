-- Tablas de relación muchos-a-muchos entre exercises y muscle_groups/equipment,
-- reemplazando las FK 1:1 (exercises.muscle_group_id / exercises.equipment_id).
CREATE TABLE public.exercise_muscle_groups (
  exercise_id uuid NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  muscle_group_id uuid NOT NULL REFERENCES public.muscle_groups(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (exercise_id, muscle_group_id)
);
CREATE INDEX idx_exercise_muscle_groups_muscle_group ON public.exercise_muscle_groups(muscle_group_id);

CREATE TABLE public.exercise_equipment (
  exercise_id uuid NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  equipment_id uuid NOT NULL REFERENCES public.equipment(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (exercise_id, equipment_id)
);
CREATE INDEX idx_exercise_equipment_equipment ON public.exercise_equipment(equipment_id);

ALTER TABLE public.exercise_muscle_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_equipment ENABLE ROW LEVEL SECURITY;

CREATE POLICY "exercise_muscle_groups: read" ON public.exercise_muscle_groups FOR SELECT TO authenticated USING (true);
CREATE POLICY "exercise_muscle_groups: admin insert" ON public.exercise_muscle_groups FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "exercise_muscle_groups: admin update" ON public.exercise_muscle_groups FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "exercise_muscle_groups: admin delete" ON public.exercise_muscle_groups FOR DELETE TO authenticated USING (public.is_admin());

CREATE POLICY "exercise_equipment: read" ON public.exercise_equipment FOR SELECT TO authenticated USING (true);
CREATE POLICY "exercise_equipment: admin insert" ON public.exercise_equipment FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "exercise_equipment: admin update" ON public.exercise_equipment FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "exercise_equipment: admin delete" ON public.exercise_equipment FOR DELETE TO authenticated USING (public.is_admin());
