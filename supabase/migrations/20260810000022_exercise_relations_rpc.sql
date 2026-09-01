-- RPC que escribe un ejercicio y sus relaciones (grupos musculares/equipo) de forma
-- atómica en 3 tablas. Sin esto, una falla a mitad de camino dejaría un ejercicio
-- guardado sin sus relaciones (create/update directo desde el cliente ya no alcanza
-- ahora que la relación es muchos-a-muchos vía tablas de junction).
CREATE OR REPLACE FUNCTION public.upsert_exercise_with_relations(
  p_id uuid,
  p_exercise jsonb,
  p_muscle_group_ids uuid[],
  p_equipment_ids uuid[]
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  IF p_muscle_group_ids IS NULL OR array_length(p_muscle_group_ids, 1) IS NULL THEN
    RAISE EXCEPTION 'At least one muscle group is required';
  END IF;

  IF p_id IS NULL THEN
    INSERT INTO exercises (name_es, name_en, description_es, description_en,
      instructions_es, instructions_en, tips_es, tips_en, image_url, external_id,
      fitgifs_slug, difficulty, active)
    SELECT p_exercise->>'name_es', p_exercise->>'name_en',
      p_exercise->>'description_es', p_exercise->>'description_en',
      p_exercise->>'instructions_es', p_exercise->>'instructions_en',
      p_exercise->>'tips_es', p_exercise->>'tips_en',
      p_exercise->>'image_url', p_exercise->>'external_id', p_exercise->>'fitgifs_slug',
      COALESCE((p_exercise->>'difficulty')::exercise_difficulty, 'beginner'),
      COALESCE((p_exercise->>'active')::boolean, true)
    RETURNING id INTO v_id;
  ELSE
    UPDATE exercises SET
      name_es = p_exercise->>'name_es', name_en = p_exercise->>'name_en',
      description_es = p_exercise->>'description_es', description_en = p_exercise->>'description_en',
      instructions_es = p_exercise->>'instructions_es', instructions_en = p_exercise->>'instructions_en',
      tips_es = p_exercise->>'tips_es', tips_en = p_exercise->>'tips_en',
      image_url = p_exercise->>'image_url', external_id = p_exercise->>'external_id',
      fitgifs_slug = p_exercise->>'fitgifs_slug',
      difficulty = COALESCE((p_exercise->>'difficulty')::exercise_difficulty, difficulty),
      updated_at = now()
    WHERE id = p_id
    RETURNING id INTO v_id;
  END IF;

  DELETE FROM exercise_muscle_groups WHERE exercise_id = v_id;
  INSERT INTO exercise_muscle_groups (exercise_id, muscle_group_id) SELECT v_id, unnest(p_muscle_group_ids);

  DELETE FROM exercise_equipment WHERE exercise_id = v_id;
  IF p_equipment_ids IS NOT NULL AND array_length(p_equipment_ids, 1) > 0 THEN
    INSERT INTO exercise_equipment (exercise_id, equipment_id) SELECT v_id, unnest(p_equipment_ids);
  END IF;

  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.upsert_exercise_with_relations(uuid, jsonb, uuid[], uuid[]) TO authenticated;
