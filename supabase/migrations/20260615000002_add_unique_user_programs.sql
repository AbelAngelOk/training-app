-- Add unique constraint on user_id to user_programs table
-- This ensures a user can only have one active program at a time
ALTER TABLE public.user_programs
ADD CONSTRAINT unique_user_active_program UNIQUE (user_id);
