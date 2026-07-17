-- =============================================================================
-- Migration: history indexes
-- Supports the session progress history query: resolve sibling sessions via
-- source_session_id (successive copies of the same root template) and fetch
-- a user's executions of those sessions ordered by recency.
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_workout_executions_user_session
  ON public.workout_executions (user_id, training_session_id, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_training_sessions_source
  ON public.training_sessions (source_session_id);
