-- Temporary diagnostic: expose the live source of duplicate_program_deep so
-- we can confirm whether the previous migration's redefinition actually took.
CREATE OR REPLACE FUNCTION public.debug_get_function_source(p_name text)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT pg_get_functiondef(oid) FROM pg_proc WHERE proname = p_name LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.debug_get_function_source(text) TO authenticated;
