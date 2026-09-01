-- Removes the temporary diagnostic function from 20260822000025, used only to
-- confirm the duplicate_program_deep fix (20260822000024) was actually live.
DROP FUNCTION IF EXISTS public.debug_get_function_source(text);
