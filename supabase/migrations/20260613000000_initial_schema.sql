-- =============================================================================
-- INITIAL SCHEMA
-- =============================================================================

-- =============================================================================
-- ENUM TYPES
-- =============================================================================

CREATE TYPE user_role AS ENUM (
  'free_user',
  'premium_user',
  'coach',
  'admin'
);

CREATE TYPE subscription_status AS ENUM (
  'active',
  'expired',
  'cancelled',
  'grace_period'
);

CREATE TYPE program_type AS ENUM (
  'official',
  'personal'
);

CREATE TYPE weekday AS ENUM (
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday'
);

CREATE TYPE session_type AS ENUM (
  'official',
  'personal'
);

CREATE TYPE exercise_difficulty AS ENUM (
  'beginner',
  'intermediate',
  'advanced'
);

CREATE TYPE workout_status AS ENUM (
  'in_progress',
  'completed',
  'cancelled'
);

CREATE TYPE calendar_status AS ENUM (
  'scheduled',
  'completed',
  'skipped'
);

CREATE TYPE friend_request_status AS ENUM (
  'pending',
  'accepted',
  'rejected'
);

CREATE TYPE health_provider AS ENUM (
  'health_connect',
  'apple_health',
  'garmin',
  'fitbit',
  'samsung_health'
);

CREATE TYPE ranking_type AS ENUM (
  'training_hours',
  'weight_lifted',
  'distance'
);

CREATE TYPE coach_client_status AS ENUM (
  'active',
  'inactive'
);

-- =============================================================================
-- UPDATED_AT HELPER FUNCTION
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- TABLES
-- =============================================================================

-- -----------------------------------------------------------------------------
-- users
-- Extends auth.users. Created automatically via trigger on registration.
-- -----------------------------------------------------------------------------
CREATE TABLE public.users (
  id         uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      text        NOT NULL,
  role       user_role   NOT NULL DEFAULT 'free_user',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- -----------------------------------------------------------------------------
-- user_profiles
-- -----------------------------------------------------------------------------
CREATE TABLE public.user_profiles (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  display_name text,
  avatar_url   text,
  city         text,
  province     text,
  country      text,
  bio          text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- -----------------------------------------------------------------------------
-- subscription_plans
-- -----------------------------------------------------------------------------
CREATE TABLE public.subscription_plans (
  id              uuid           PRIMARY KEY DEFAULT gen_random_uuid(),
  code            text           NOT NULL UNIQUE,
  name            text           NOT NULL,
  duration_months integer        NOT NULL,
  price           numeric(10, 2) NOT NULL,
  active          boolean        NOT NULL DEFAULT true,
  created_at      timestamptz    NOT NULL DEFAULT now(),
  updated_at      timestamptz    NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_subscription_plans_updated_at
  BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- -----------------------------------------------------------------------------
-- user_subscriptions
-- -----------------------------------------------------------------------------
CREATE TABLE public.user_subscriptions (
  id                   uuid                NOT NULL DEFAULT gen_random_uuid(),
  user_id              uuid                NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subscription_plan_id uuid                NOT NULL REFERENCES public.subscription_plans(id),
  store_provider       text,
  store_transaction_id text,
  starts_at            timestamptz         NOT NULL,
  expires_at           timestamptz         NOT NULL,
  status               subscription_status NOT NULL DEFAULT 'active',
  created_at           timestamptz         NOT NULL DEFAULT now(),
  updated_at           timestamptz         NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE TRIGGER trg_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- -----------------------------------------------------------------------------
-- muscle_groups
-- -----------------------------------------------------------------------------
CREATE TABLE public.muscle_groups (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text        NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_muscle_groups_updated_at
  BEFORE UPDATE ON public.muscle_groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- -----------------------------------------------------------------------------
-- equipment
-- -----------------------------------------------------------------------------
CREATE TABLE public.equipment (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text        NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_equipment_updated_at
  BEFORE UPDATE ON public.equipment
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- -----------------------------------------------------------------------------
-- exercises
-- -----------------------------------------------------------------------------
CREATE TABLE public.exercises (
  id               uuid                NOT NULL DEFAULT gen_random_uuid(),
  name             text                NOT NULL,
  description      text,
  instructions     text,
  image_url        text,
  video_url        text,
  muscle_group_id  uuid                NOT NULL REFERENCES public.muscle_groups(id),
  equipment_id     uuid                REFERENCES public.equipment(id),
  difficulty       exercise_difficulty NOT NULL DEFAULT 'beginner',
  created_at       timestamptz         NOT NULL DEFAULT now(),
  updated_at       timestamptz         NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE TRIGGER trg_exercises_updated_at
  BEFORE UPDATE ON public.exercises
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- -----------------------------------------------------------------------------
-- workout_programs
-- Supports official programs (owner_id NULL) and personal copies.
-- source_program_id references the original when duplicated.
-- -----------------------------------------------------------------------------
CREATE TABLE public.workout_programs (
  id                uuid         NOT NULL DEFAULT gen_random_uuid(),
  name              text         NOT NULL,
  description       text,
  type              program_type NOT NULL DEFAULT 'personal',
  owner_id          uuid         REFERENCES public.users(id) ON DELETE SET NULL,
  source_program_id uuid         REFERENCES public.workout_programs(id) ON DELETE SET NULL,
  active            boolean      NOT NULL DEFAULT true,
  created_at        timestamptz  NOT NULL DEFAULT now(),
  updated_at        timestamptz  NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE TRIGGER trg_workout_programs_updated_at
  BEFORE UPDATE ON public.workout_programs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- -----------------------------------------------------------------------------
-- training_sessions
-- Supports official sessions (owner_id NULL) and personal copies.
-- -----------------------------------------------------------------------------
CREATE TABLE public.training_sessions (
  id                         uuid         NOT NULL DEFAULT gen_random_uuid(),
  name                       text         NOT NULL,
  description                text,
  type                       session_type NOT NULL DEFAULT 'personal',
  owner_id                   uuid         REFERENCES public.users(id) ON DELETE SET NULL,
  source_session_id          uuid         REFERENCES public.training_sessions(id) ON DELETE SET NULL,
  estimated_duration_minutes integer,
  created_at                 timestamptz  NOT NULL DEFAULT now(),
  updated_at                 timestamptz  NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE TRIGGER trg_training_sessions_updated_at
  BEFORE UPDATE ON public.training_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- -----------------------------------------------------------------------------
-- user_programs
-- Active program assigned to a user.
-- -----------------------------------------------------------------------------
CREATE TABLE public.user_programs (
  id                 uuid        NOT NULL DEFAULT gen_random_uuid(),
  user_id            uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  workout_program_id uuid        NOT NULL REFERENCES public.workout_programs(id) ON DELETE CASCADE,
  assigned_at        timestamptz NOT NULL DEFAULT now(),
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE TRIGGER trg_user_programs_updated_at
  BEFORE UPDATE ON public.user_programs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- -----------------------------------------------------------------------------
-- program_days
-- Maps a weekday to a training session within a program.
-- -----------------------------------------------------------------------------
CREATE TABLE public.program_days (
  id                 uuid        NOT NULL DEFAULT gen_random_uuid(),
  workout_program_id uuid        NOT NULL REFERENCES public.workout_programs(id) ON DELETE CASCADE,
  weekday            weekday     NOT NULL,
  training_session_id uuid       NOT NULL REFERENCES public.training_sessions(id) ON DELETE CASCADE,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE TRIGGER trg_program_days_updated_at
  BEFORE UPDATE ON public.program_days
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- -----------------------------------------------------------------------------
-- session_exercises
-- Exercise configuration inside a session.
-- -----------------------------------------------------------------------------
CREATE TABLE public.session_exercises (
  id                    uuid           NOT NULL DEFAULT gen_random_uuid(),
  training_session_id   uuid           NOT NULL REFERENCES public.training_sessions(id) ON DELETE CASCADE,
  exercise_id           uuid           NOT NULL REFERENCES public.exercises(id) ON DELETE RESTRICT,
  sort_order            integer        NOT NULL DEFAULT 0,
  target_sets           integer,
  target_reps           integer,
  target_weight         numeric(8, 2),
  target_duration_seconds integer,
  target_distance_meters  numeric(10, 2),
  rest_seconds          integer,
  created_at            timestamptz    NOT NULL DEFAULT now(),
  updated_at            timestamptz    NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE TRIGGER trg_session_exercises_updated_at
  BEFORE UPDATE ON public.session_exercises
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- -----------------------------------------------------------------------------
-- workout_executions
-- Real training session performed by a user.
-- Historical records must never be deleted.
-- -----------------------------------------------------------------------------
CREATE TABLE public.workout_executions (
  id                  uuid           NOT NULL DEFAULT gen_random_uuid(),
  user_id             uuid           NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  training_session_id uuid           NOT NULL REFERENCES public.training_sessions(id),
  started_at          timestamptz    NOT NULL DEFAULT now(),
  completed_at        timestamptz,
  duration_seconds    integer,
  status              workout_status NOT NULL DEFAULT 'in_progress',
  created_at          timestamptz    NOT NULL DEFAULT now(),
  updated_at          timestamptz    NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE TRIGGER trg_workout_executions_updated_at
  BEFORE UPDATE ON public.workout_executions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- -----------------------------------------------------------------------------
-- workout_exercise_executions
-- Execution record for a specific exercise within a workout.
-- -----------------------------------------------------------------------------
CREATE TABLE public.workout_exercise_executions (
  id                   uuid        NOT NULL DEFAULT gen_random_uuid(),
  workout_execution_id uuid        NOT NULL REFERENCES public.workout_executions(id) ON DELETE CASCADE,
  session_exercise_id  uuid        NOT NULL REFERENCES public.session_exercises(id) ON DELETE RESTRICT,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE TRIGGER trg_workout_exercise_executions_updated_at
  BEFORE UPDATE ON public.workout_exercise_executions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- -----------------------------------------------------------------------------
-- workout_sets
-- Lowest-level unit: a single executed set.
-- -----------------------------------------------------------------------------
CREATE TABLE public.workout_sets (
  id                            uuid           NOT NULL DEFAULT gen_random_uuid(),
  workout_exercise_execution_id uuid           NOT NULL REFERENCES public.workout_exercise_executions(id) ON DELETE CASCADE,
  set_number                    integer        NOT NULL,
  weight                        numeric(8, 2),
  reps                          integer,
  duration_seconds              integer,
  distance_meters               numeric(10, 2),
  created_at                    timestamptz    NOT NULL DEFAULT now(),
  updated_at                    timestamptz    NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE TRIGGER trg_workout_sets_updated_at
  BEFORE UPDATE ON public.workout_sets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- -----------------------------------------------------------------------------
-- calendar_events
-- Scheduled training events. Managed exclusively by backend Edge Functions.
-- -----------------------------------------------------------------------------
CREATE TABLE public.calendar_events (
  id                  uuid            NOT NULL DEFAULT gen_random_uuid(),
  user_id             uuid            NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  training_session_id uuid            NOT NULL REFERENCES public.training_sessions(id),
  scheduled_date      date            NOT NULL,
  status              calendar_status NOT NULL DEFAULT 'scheduled',
  created_at          timestamptz     NOT NULL DEFAULT now(),
  updated_at          timestamptz     NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  CONSTRAINT unique_calendar_event UNIQUE (user_id, training_session_id, scheduled_date)
);

CREATE TRIGGER trg_calendar_events_updated_at
  BEFORE UPDATE ON public.calendar_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- -----------------------------------------------------------------------------
-- user_stats
-- Aggregated lifetime stats. One row per user.
-- Updated exclusively by Edge Functions.
-- -----------------------------------------------------------------------------
CREATE TABLE public.user_stats (
  user_id                uuid           PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  total_workouts         integer        NOT NULL DEFAULT 0,
  total_training_seconds bigint         NOT NULL DEFAULT 0,
  total_weight_lifted    numeric(14, 2) NOT NULL DEFAULT 0,
  total_distance_meters  numeric(14, 2) NOT NULL DEFAULT 0,
  current_streak         integer        NOT NULL DEFAULT 0,
  best_streak            integer        NOT NULL DEFAULT 0,
  created_at             timestamptz    NOT NULL DEFAULT now(),
  updated_at             timestamptz    NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_user_stats_updated_at
  BEFORE UPDATE ON public.user_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- -----------------------------------------------------------------------------
-- friend_requests
-- -----------------------------------------------------------------------------
CREATE TABLE public.friend_requests (
  id          uuid                  NOT NULL DEFAULT gen_random_uuid(),
  sender_id   uuid                  NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  receiver_id uuid                  NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status      friend_request_status NOT NULL DEFAULT 'pending',
  created_at  timestamptz           NOT NULL DEFAULT now(),
  updated_at  timestamptz           NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  CONSTRAINT no_self_friend_request CHECK (sender_id != receiver_id),
  CONSTRAINT unique_friend_request  UNIQUE (sender_id, receiver_id)
);

CREATE TRIGGER trg_friend_requests_updated_at
  BEFORE UPDATE ON public.friend_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- -----------------------------------------------------------------------------
-- friendships
-- Created by Edge Function on request acceptance.
-- -----------------------------------------------------------------------------
CREATE TABLE public.friendships (
  id         uuid        NOT NULL DEFAULT gen_random_uuid(),
  user_a_id  uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  user_b_id  uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  CONSTRAINT no_self_friendship UNIQUE (user_a_id, user_b_id),
  CONSTRAINT unique_friendship  CHECK (user_a_id != user_b_id)
);

CREATE TRIGGER trg_friendships_updated_at
  BEFORE UPDATE ON public.friendships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- -----------------------------------------------------------------------------
-- ranking_snapshots
-- Managed exclusively by Edge Functions.
-- -----------------------------------------------------------------------------
CREATE TABLE public.ranking_snapshots (
  id            uuid         NOT NULL DEFAULT gen_random_uuid(),
  user_id       uuid         NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  ranking_type  ranking_type NOT NULL,
  value         numeric(14, 4) NOT NULL DEFAULT 0,
  city          text,
  province      text,
  country       text,
  snapshot_date date         NOT NULL,
  created_at    timestamptz  NOT NULL DEFAULT now(),
  updated_at    timestamptz  NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  CONSTRAINT unique_ranking_snapshot UNIQUE (user_id, ranking_type, snapshot_date)
);

CREATE TRIGGER trg_ranking_snapshots_updated_at
  BEFORE UPDATE ON public.ranking_snapshots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- -----------------------------------------------------------------------------
-- achievements
-- Reference catalog managed by admins.
-- -----------------------------------------------------------------------------
CREATE TABLE public.achievements (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  code        text        NOT NULL UNIQUE,
  name        text        NOT NULL,
  description text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_achievements_updated_at
  BEFORE UPDATE ON public.achievements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- -----------------------------------------------------------------------------
-- user_achievements
-- Unlocked by Edge Functions only.
-- -----------------------------------------------------------------------------
CREATE TABLE public.user_achievements (
  id             uuid        NOT NULL DEFAULT gen_random_uuid(),
  user_id        uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  achievement_id uuid        NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at    timestamptz NOT NULL DEFAULT now(),
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  CONSTRAINT unique_user_achievement UNIQUE (user_id, achievement_id)
);

CREATE TRIGGER trg_user_achievements_updated_at
  BEFORE UPDATE ON public.user_achievements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- -----------------------------------------------------------------------------
-- health_connections
-- -----------------------------------------------------------------------------
CREATE TABLE public.health_connections (
  id               uuid            NOT NULL DEFAULT gen_random_uuid(),
  user_id          uuid            NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  provider         health_provider NOT NULL,
  external_user_id text,
  connected_at     timestamptz     NOT NULL DEFAULT now(),
  created_at       timestamptz     NOT NULL DEFAULT now(),
  updated_at       timestamptz     NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  CONSTRAINT unique_health_connection UNIQUE (user_id, provider)
);

CREATE TRIGGER trg_health_connections_updated_at
  BEFORE UPDATE ON public.health_connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- -----------------------------------------------------------------------------
-- coach_clients (future)
-- -----------------------------------------------------------------------------
CREATE TABLE public.coach_clients (
  id         uuid                NOT NULL DEFAULT gen_random_uuid(),
  coach_id   uuid                NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  client_id  uuid                NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status     coach_client_status NOT NULL DEFAULT 'active',
  created_at timestamptz         NOT NULL DEFAULT now(),
  updated_at timestamptz         NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  CONSTRAINT no_self_coach_client UNIQUE (coach_id, client_id),
  CONSTRAINT coach_client_not_same CHECK (coach_id != client_id)
);

CREATE TRIGGER trg_coach_clients_updated_at
  BEFORE UPDATE ON public.coach_clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- AUTH TRIGGER: auto-provision public.users + user_stats on signup
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (NEW.id, NEW.email, 'free_user');

  INSERT INTO public.user_stats (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX idx_users_email
  ON public.users (email);

CREATE INDEX idx_user_profiles_country
  ON public.user_profiles (country);

CREATE INDEX idx_user_profiles_province
  ON public.user_profiles (province);

CREATE INDEX idx_user_profiles_city
  ON public.user_profiles (city);

CREATE INDEX idx_workout_executions_user_id
  ON public.workout_executions (user_id);

CREATE INDEX idx_workout_executions_started_at
  ON public.workout_executions (started_at);

CREATE INDEX idx_calendar_events_user_id
  ON public.calendar_events (user_id);

CREATE INDEX idx_friendships_user_a_id
  ON public.friendships (user_a_id);

CREATE INDEX idx_friendships_user_b_id
  ON public.friendships (user_b_id);

CREATE INDEX idx_ranking_snapshots_ranking_type
  ON public.ranking_snapshots (ranking_type);

CREATE INDEX idx_ranking_snapshots_country
  ON public.ranking_snapshots (country);

CREATE INDEX idx_ranking_snapshots_province
  ON public.ranking_snapshots (province);

CREATE INDEX idx_ranking_snapshots_city
  ON public.ranking_snapshots (city);

CREATE INDEX idx_ranking_snapshots_value
  ON public.ranking_snapshots (value);

-- =============================================================================
-- HELPER FUNCTIONS (SECURITY DEFINER)
-- Used in RLS policies to avoid N+1 policy checks on join-dependent tables.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.owns_workout_program(p_program_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workout_programs
    WHERE id = p_program_id
      AND owner_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.owns_training_session(p_session_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.training_sessions
    WHERE id = p_session_id
      AND owner_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.owns_workout_execution(p_execution_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workout_executions
    WHERE id = p_execution_id
      AND user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE public.users                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.muscle_groups             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_programs          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_sessions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_programs             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_days              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_exercises         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_executions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_exercise_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sets              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friend_requests           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ranking_snapshots         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_connections        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_clients             ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- RLS POLICIES
-- =============================================================================

-- -----------------------------------------------------------------------------
-- users
-- -----------------------------------------------------------------------------
CREATE POLICY "users: select all authenticated"
  ON public.users FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "users: update own"
  ON public.users FOR UPDATE TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "users: delete own"
  ON public.users FOR DELETE TO authenticated
  USING (auth.uid() = id);

-- -----------------------------------------------------------------------------
-- user_profiles
-- -----------------------------------------------------------------------------
CREATE POLICY "user_profiles: select all authenticated"
  ON public.user_profiles FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "user_profiles: insert own"
  ON public.user_profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_profiles: update own"
  ON public.user_profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "user_profiles: delete own"
  ON public.user_profiles FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- subscription_plans (public read — needed for paywall display)
-- -----------------------------------------------------------------------------
CREATE POLICY "subscription_plans: select all"
  ON public.subscription_plans FOR SELECT
  USING (true);

-- -----------------------------------------------------------------------------
-- user_subscriptions (write managed by Edge Functions via service_role)
-- -----------------------------------------------------------------------------
CREATE POLICY "user_subscriptions: select own"
  ON public.user_subscriptions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- muscle_groups (reference data)
-- -----------------------------------------------------------------------------
CREATE POLICY "muscle_groups: select all authenticated"
  ON public.muscle_groups FOR SELECT TO authenticated
  USING (true);

-- -----------------------------------------------------------------------------
-- equipment (reference data)
-- -----------------------------------------------------------------------------
CREATE POLICY "equipment: select all authenticated"
  ON public.equipment FOR SELECT TO authenticated
  USING (true);

-- -----------------------------------------------------------------------------
-- exercises (reference data, admin-managed)
-- -----------------------------------------------------------------------------
CREATE POLICY "exercises: select all authenticated"
  ON public.exercises FOR SELECT TO authenticated
  USING (true);

-- -----------------------------------------------------------------------------
-- workout_programs
-- -----------------------------------------------------------------------------
CREATE POLICY "workout_programs: select official"
  ON public.workout_programs FOR SELECT TO authenticated
  USING (type = 'official');

CREATE POLICY "workout_programs: select personal own"
  ON public.workout_programs FOR SELECT TO authenticated
  USING (type = 'personal' AND auth.uid() = owner_id);

CREATE POLICY "workout_programs: insert personal own"
  ON public.workout_programs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = owner_id AND type = 'personal');

CREATE POLICY "workout_programs: update personal own"
  ON public.workout_programs FOR UPDATE TO authenticated
  USING (auth.uid() = owner_id AND type = 'personal');

CREATE POLICY "workout_programs: delete personal own"
  ON public.workout_programs FOR DELETE TO authenticated
  USING (auth.uid() = owner_id AND type = 'personal');

-- -----------------------------------------------------------------------------
-- training_sessions
-- -----------------------------------------------------------------------------
CREATE POLICY "training_sessions: select official"
  ON public.training_sessions FOR SELECT TO authenticated
  USING (type = 'official');

CREATE POLICY "training_sessions: select personal own"
  ON public.training_sessions FOR SELECT TO authenticated
  USING (type = 'personal' AND auth.uid() = owner_id);

CREATE POLICY "training_sessions: insert personal own"
  ON public.training_sessions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = owner_id AND type = 'personal');

CREATE POLICY "training_sessions: update personal own"
  ON public.training_sessions FOR UPDATE TO authenticated
  USING (auth.uid() = owner_id AND type = 'personal');

CREATE POLICY "training_sessions: delete personal own"
  ON public.training_sessions FOR DELETE TO authenticated
  USING (auth.uid() = owner_id AND type = 'personal');

-- -----------------------------------------------------------------------------
-- user_programs
-- -----------------------------------------------------------------------------
CREATE POLICY "user_programs: select own"
  ON public.user_programs FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "user_programs: insert own"
  ON public.user_programs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_programs: update own"
  ON public.user_programs FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "user_programs: delete own"
  ON public.user_programs FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- program_days (ownership via parent workout_program)
-- -----------------------------------------------------------------------------
CREATE POLICY "program_days: select official"
  ON public.program_days FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.workout_programs wp
      WHERE wp.id = workout_program_id AND wp.type = 'official'
    )
  );

CREATE POLICY "program_days: select personal own"
  ON public.program_days FOR SELECT TO authenticated
  USING (public.owns_workout_program(workout_program_id));

CREATE POLICY "program_days: insert own program"
  ON public.program_days FOR INSERT TO authenticated
  WITH CHECK (public.owns_workout_program(workout_program_id));

CREATE POLICY "program_days: update own program"
  ON public.program_days FOR UPDATE TO authenticated
  USING (public.owns_workout_program(workout_program_id));

CREATE POLICY "program_days: delete own program"
  ON public.program_days FOR DELETE TO authenticated
  USING (public.owns_workout_program(workout_program_id));

-- -----------------------------------------------------------------------------
-- session_exercises (ownership via parent training_session)
-- -----------------------------------------------------------------------------
CREATE POLICY "session_exercises: select official"
  ON public.session_exercises FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.training_sessions ts
      WHERE ts.id = training_session_id AND ts.type = 'official'
    )
  );

CREATE POLICY "session_exercises: select personal own"
  ON public.session_exercises FOR SELECT TO authenticated
  USING (public.owns_training_session(training_session_id));

CREATE POLICY "session_exercises: insert own session"
  ON public.session_exercises FOR INSERT TO authenticated
  WITH CHECK (public.owns_training_session(training_session_id));

CREATE POLICY "session_exercises: update own session"
  ON public.session_exercises FOR UPDATE TO authenticated
  USING (public.owns_training_session(training_session_id));

CREATE POLICY "session_exercises: delete own session"
  ON public.session_exercises FOR DELETE TO authenticated
  USING (public.owns_training_session(training_session_id));

-- -----------------------------------------------------------------------------
-- workout_executions (no DELETE — historical records preserved)
-- -----------------------------------------------------------------------------
CREATE POLICY "workout_executions: select own"
  ON public.workout_executions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "workout_executions: insert own"
  ON public.workout_executions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "workout_executions: update own in_progress"
  ON public.workout_executions FOR UPDATE TO authenticated
  USING (auth.uid() = user_id AND status = 'in_progress');

-- -----------------------------------------------------------------------------
-- workout_exercise_executions (no DELETE)
-- -----------------------------------------------------------------------------
CREATE POLICY "workout_exercise_executions: select own"
  ON public.workout_exercise_executions FOR SELECT TO authenticated
  USING (public.owns_workout_execution(workout_execution_id));

CREATE POLICY "workout_exercise_executions: insert own"
  ON public.workout_exercise_executions FOR INSERT TO authenticated
  WITH CHECK (public.owns_workout_execution(workout_execution_id));

CREATE POLICY "workout_exercise_executions: update own"
  ON public.workout_exercise_executions FOR UPDATE TO authenticated
  USING (public.owns_workout_execution(workout_execution_id));

-- -----------------------------------------------------------------------------
-- workout_sets (no DELETE — ownership resolved via JOIN chain)
-- -----------------------------------------------------------------------------
CREATE POLICY "workout_sets: select own"
  ON public.workout_sets FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.workout_exercise_executions wee
      WHERE wee.id = workout_exercise_execution_id
        AND public.owns_workout_execution(wee.workout_execution_id)
    )
  );

CREATE POLICY "workout_sets: insert own"
  ON public.workout_sets FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workout_exercise_executions wee
      WHERE wee.id = workout_exercise_execution_id
        AND public.owns_workout_execution(wee.workout_execution_id)
    )
  );

CREATE POLICY "workout_sets: update own"
  ON public.workout_sets FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.workout_exercise_executions wee
      WHERE wee.id = workout_exercise_execution_id
        AND public.owns_workout_execution(wee.workout_execution_id)
    )
  );

-- -----------------------------------------------------------------------------
-- calendar_events (write managed by Edge Functions via service_role)
-- -----------------------------------------------------------------------------
CREATE POLICY "calendar_events: select own"
  ON public.calendar_events FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- user_stats (write managed by Edge Functions via service_role)
-- -----------------------------------------------------------------------------
CREATE POLICY "user_stats: select all authenticated"
  ON public.user_stats FOR SELECT TO authenticated
  USING (true);

-- -----------------------------------------------------------------------------
-- friend_requests
-- -----------------------------------------------------------------------------
CREATE POLICY "friend_requests: select own"
  ON public.friend_requests FOR SELECT TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "friend_requests: insert own sender"
  ON public.friend_requests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "friend_requests: update receiver pending"
  ON public.friend_requests FOR UPDATE TO authenticated
  USING (auth.uid() = receiver_id AND status = 'pending');

CREATE POLICY "friend_requests: delete sender pending"
  ON public.friend_requests FOR DELETE TO authenticated
  USING (auth.uid() = sender_id AND status = 'pending');

-- -----------------------------------------------------------------------------
-- friendships (INSERT managed by Edge Function on request acceptance)
-- -----------------------------------------------------------------------------
CREATE POLICY "friendships: select participants"
  ON public.friendships FOR SELECT TO authenticated
  USING (auth.uid() = user_a_id OR auth.uid() = user_b_id);

CREATE POLICY "friendships: delete participants"
  ON public.friendships FOR DELETE TO authenticated
  USING (auth.uid() = user_a_id OR auth.uid() = user_b_id);

-- -----------------------------------------------------------------------------
-- ranking_snapshots (write managed by Edge Functions via service_role)
-- -----------------------------------------------------------------------------
CREATE POLICY "ranking_snapshots: select all authenticated"
  ON public.ranking_snapshots FOR SELECT TO authenticated
  USING (true);

-- -----------------------------------------------------------------------------
-- achievements (reference catalog)
-- -----------------------------------------------------------------------------
CREATE POLICY "achievements: select all authenticated"
  ON public.achievements FOR SELECT TO authenticated
  USING (true);

-- -----------------------------------------------------------------------------
-- user_achievements (INSERT managed by Edge Functions via service_role)
-- -----------------------------------------------------------------------------
CREATE POLICY "user_achievements: select all authenticated"
  ON public.user_achievements FOR SELECT TO authenticated
  USING (true);

-- -----------------------------------------------------------------------------
-- health_connections
-- -----------------------------------------------------------------------------
CREATE POLICY "health_connections: select own"
  ON public.health_connections FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "health_connections: insert own"
  ON public.health_connections FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "health_connections: update own"
  ON public.health_connections FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "health_connections: delete own"
  ON public.health_connections FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- coach_clients (future)
-- -----------------------------------------------------------------------------
CREATE POLICY "coach_clients: select own"
  ON public.coach_clients FOR SELECT TO authenticated
  USING (auth.uid() = coach_id OR auth.uid() = client_id);

CREATE POLICY "coach_clients: insert coach"
  ON public.coach_clients FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = coach_id);

CREATE POLICY "coach_clients: update coach"
  ON public.coach_clients FOR UPDATE TO authenticated
  USING (auth.uid() = coach_id);

CREATE POLICY "coach_clients: delete coach"
  ON public.coach_clients FOR DELETE TO authenticated
  USING (auth.uid() = coach_id);
