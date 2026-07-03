# Database Design

## Purpose

This document defines the persistent data model for the platform.

The database will use PostgreSQL through Supabase.

All tables should include:

* id (uuid primary key)
* created_at
* updated_at

Unless otherwise specified.

---

# Users

## users

Represents an authenticated user.

Fields:

* id
* email
* role
* created_at
* updated_at

Role values:

* free_user
* premium_user
* coach
* admin

---

## user_profiles

Public and private profile information.

Fields:

* id
* user_id
* display_name
* avatar_url
* city
* province
* country
* bio
* created_at
* updated_at

Relationships:

* user_id → users.id

Rules:

* One profile per user.
* Country, province and city are used for rankings.

---

# Subscription System

## subscription_plans

Available subscription plans.

Fields:

* id
* code
* name
* duration_months
* price
* active
* created_at
* updated_at

Examples:

* monthly
* yearly

---

## user_subscriptions

Subscription history.

Fields:

* id
* user_id
* subscription_plan_id
* store_provider
* store_transaction_id
* starts_at
* expires_at
* status
* created_at
* updated_at

Status:

* active
* expired
* cancelled
* grace_period

Relationships:

* user_id → users.id
* subscription_plan_id → subscription_plans.id

Rules:

* A user may have multiple historical subscriptions.
* Only one active subscription at a time.

---

# Workout Programs

## workout_programs

Represents a workout program.

Programs can be official or personal.

Fields:

* id
* name
* description
* type
* owner_id
* source_program_id
* active
* created_at
* updated_at

Type values:

* official
* personal

Relationships:

* owner_id → users.id (nullable)
* source_program_id → workout_programs.id (nullable)

Rules:

* owner_id NULL = official program.
* owner_id populated = personal program.
* source_program_id references the original program when duplicated.

Examples:

Official Program:

```text
Hypertrophy 4 Days
```

Personal Copy:

```text
Hypertrophy 4 Days - Custom
```

---

## user_programs

Defines the active program assigned to a user.

Fields:

* id
* user_id
* workout_program_id
* assigned_at
* created_at
* updated_at

Relationships:

* user_id → users.id
* workout_program_id → workout_programs.id

Rules:

* A user can only have one active program at a time.

---

## program_days

Defines which session is assigned to each day.

Fields:

* id
* workout_program_id
* weekday
* training_session_id
* created_at
* updated_at

Weekday values:

* monday
* tuesday
* wednesday
* thursday
* friday
* saturday
* sunday

Relationships:

* workout_program_id → workout_programs.id
* training_session_id → training_sessions.id

---

# Training Sessions

## training_sessions

Session templates.

Can be official or personal.

Fields:

* id
* name
* description
* type
* owner_id
* source_session_id
* estimated_duration_minutes
* created_at
* updated_at

Type values:

* official
* personal

Relationships:

* owner_id → users.id (nullable)
* source_session_id → training_sessions.id (nullable)

Rules:

* Official sessions belong to the platform.
* Personal sessions belong to a user.
* Personal sessions can originate from official sessions.

Examples:

Official:

```text
Push
Pull
Legs
```

Personal:

```text
Push - Strength Focus
Push - Hypertrophy
```

---

## session_exercises

Exercises configured inside a session.

Fields:

* id
* training_session_id
* exercise_id
* sort_order
* target_sets
* target_reps
* target_weight
* target_duration_seconds
* target_distance_meters
* rest_seconds
* created_at
* updated_at

Relationships:

* training_session_id → training_sessions.id
* exercise_id → exercises.id

Rules:

* Order is defined by sort_order.

---

# Exercise Catalog

## muscle_groups

Fields:

* id
* name
* created_at
* updated_at

Examples:

* Chest
* Back
* Legs
* Shoulders
* Biceps
* Triceps
* Core

---

## equipment

Fields:

* id
* name
* created_at
* updated_at

Examples:

* Barbell
* Dumbbell
* Machine
* Bodyweight
* Kettlebell
* Resistance Band

---

## exercises

Official exercise catalog.

Fields:

* id
* name
* description
* instructions
* image_url
* video_url
* muscle_group_id
* equipment_id
* difficulty
* created_at
* updated_at

Difficulty:

* beginner
* intermediate
* advanced

Relationships:

* muscle_group_id → muscle_groups.id
* equipment_id → equipment.id

Rules:

* Exercises can only be created by administrators.

---

# Workout Execution

## workout_executions

Represents a real training session performed by a user.

Fields:

* id
* user_id
* training_session_id
* started_at
* completed_at
* duration_seconds
* status
* created_at
* updated_at

Status:

* in_progress
* completed
* cancelled

Relationships:

* user_id → users.id
* training_session_id → training_sessions.id

Rules:

* Historical records must never be deleted automatically.

---

## workout_exercise_executions

Represents the execution of a specific exercise.

Fields:

* id
* workout_execution_id
* session_exercise_id
* created_at
* updated_at

Relationships:

* workout_execution_id → workout_executions.id
* session_exercise_id → session_exercises.id

---

## workout_sets

Represents an executed set.

Fields:

* id
* workout_exercise_execution_id
* set_number
* weight
* reps
* duration_seconds
* distance_meters
* created_at
* updated_at

Relationships:

* workout_exercise_execution_id → workout_exercise_executions.id

Rules:

* This is the lowest level of workout tracking.

---

# Calendar

## calendar_events

Scheduled training events.

Fields:

* id
* user_id
* training_session_id
* scheduled_date
* status
* created_at
* updated_at

Status:

* scheduled
* completed
* skipped

Relationships:

* user_id → users.id
* training_session_id → training_sessions.id

Rules:

* Calendar is generated from the active workout program.

---

# User Statistics

## user_stats

Aggregated lifetime statistics.

Fields:

* user_id
* total_workouts
* total_training_seconds
* total_weight_lifted
* total_distance_meters
* current_streak
* best_streak
* created_at
* updated_at

Relationships:

* user_id → users.id

Rules:

* One row per user.
* Updated automatically by backend processes.

---

# Friend System

## friend_requests

Friend requests between users.

Fields:

* id
* sender_id
* receiver_id
* status
* created_at
* updated_at

Status:

* pending
* accepted
* rejected

Relationships:

* sender_id → users.id
* receiver_id → users.id

---

## friendships

Accepted friendships.

Fields:

* id
* user_a_id
* user_b_id
* created_at
* updated_at

Relationships:

* user_a_id → users.id
* user_b_id → users.id

Rules:

* Duplicate friendships are not allowed.

---

# Rankings

## ranking_snapshots

Optimized ranking table.

Fields:

* id
* user_id
* ranking_type
* value
* city
* province
* country
* snapshot_date
* created_at
* updated_at

Ranking types:

* training_hours
* weight_lifted
* distance

Relationships:

* user_id → users.id

Rules:

* Managed through Edge Functions.
* Global rankings only include premium users.
* Friend rankings include all users.

---

# Achievements

## achievements

Available achievements.

Fields:

* id
* code
* name
* description
* created_at
* updated_at

Examples:

* FIRST_WORKOUT
* TEN_WORKOUTS
* HUNDRED_HOURS
* TEN_THOUSAND_KG

---

## user_achievements

Unlocked achievements.

Fields:

* id
* user_id
* achievement_id
* unlocked_at
* created_at
* updated_at

Relationships:

* user_id → users.id
* achievement_id → achievements.id

---

# Health Integrations

## health_connections

Connected health providers.

Fields:

* id
* user_id
* provider
* external_user_id
* connected_at
* created_at
* updated_at

Provider values:

* health_connect
* apple_health
* garmin
* fitbit
* samsung_health

Relationships:

* user_id → users.id

---

# Coaches (Future)

## coach_clients

Relationship between coach and client.

Fields:

* id
* coach_id
* client_id
* status
* created_at
* updated_at

Relationships:

* coach_id → users.id
* client_id → users.id

Status:

* active
* inactive

---

# Recommended Indexes

Create indexes on:

* users.email
* user_profiles.country
* user_profiles.province
* user_profiles.city
* workout_executions.user_id
* workout_executions.started_at
* calendar_events.user_id
* friendships.user_a_id
* friendships.user_b_id
* ranking_snapshots.ranking_type
* ranking_snapshots.country
* ranking_snapshots.province
* ranking_snapshots.city
* ranking_snapshots.value

---

# Backend Responsibilities

The following operations should be executed through Edge Functions:

* Subscription validation.
* Ranking calculations.
* Statistics aggregation.
* Streak calculations.
* Achievement unlocks.
* Health integration synchronization.
* Friend ranking generation.
* Future coach functionality.
* Future marketplace functionality.

---

# Design Principles

1. Preserve historical workout data permanently.
2. Official content is immutable for users.
3. User customizations are always created as copies.
4. Rankings must be reproducible from stored data.
5. Critical business logic belongs in backend services.
6. Mobile apps, web apps and future portals must consume the same backend APIs.
7. The schema must support future coach and marketplace features without major redesigns.

---

# Row Level Security (RLS)

RLS must be enabled on all tables.

All policies use `auth.uid()` to identify the current authenticated user.

The `service_role` key bypasses all RLS policies and is used exclusively by backend Edge Functions. It must never be exposed to the client application.

---

## Policy Definitions

### users

| Operation | Allowed | Condition |
|---|---|---|
| SELECT | All authenticated users | Needed for social features and rankings display |
| INSERT | System only | Created via auth trigger on registration |
| UPDATE | Own row only | `auth.uid() = id` |
| DELETE | Own row only | `auth.uid() = id` |

---

### user_profiles

| Operation | Allowed | Condition |
|---|---|---|
| SELECT | All authenticated users | Public profile data needed for social features |
| INSERT | Own profile only | `auth.uid() = user_id` |
| UPDATE | Own profile only | `auth.uid() = user_id` |
| DELETE | Own profile only | `auth.uid() = user_id` |

---

### subscription_plans

| Operation | Allowed | Condition |
|---|---|---|
| SELECT | All (including unauthenticated) | Needed for marketing and paywall display |
| INSERT / UPDATE / DELETE | Service role only | `false` |

---

### user_subscriptions

| Operation | Allowed | Condition |
|---|---|---|
| SELECT | Own records only | `auth.uid() = user_id` |
| INSERT | Service role only | `false` — managed by Edge Function after store validation |
| UPDATE | Service role only | `false` |
| DELETE | Never | `false` |

---

### workout_programs

| Operation | Allowed | Condition |
|---|---|---|
| SELECT official | All authenticated | `type = 'official'` |
| SELECT personal | Owner only | `auth.uid() = owner_id` |
| INSERT | Owner only (personal) | `auth.uid() = owner_id AND type = 'personal'` |
| UPDATE | Owner only (personal) | `auth.uid() = owner_id AND type = 'personal'` |
| DELETE | Owner only (personal) | `auth.uid() = owner_id AND type = 'personal'` |

Official programs are immutable to all non-admin users.

---

### user_programs

| Operation | Allowed | Condition |
|---|---|---|
| SELECT | Own records only | `auth.uid() = user_id` |
| INSERT | Own records only | `auth.uid() = user_id` |
| UPDATE | Own records only | `auth.uid() = user_id` |
| DELETE | Own records only | `auth.uid() = user_id` |

---

### program_days

| Operation | Allowed | Condition |
|---|---|---|
| SELECT official | All authenticated | Parent program is official |
| SELECT personal | Owner only | Parent program owner = user |
| INSERT / UPDATE / DELETE | Owner only (personal programs) | Parent program owner = user |

Requires JOIN to workout_programs for ownership check.

---

### training_sessions

| Operation | Allowed | Condition |
|---|---|---|
| SELECT official | All authenticated | `type = 'official'` |
| SELECT personal | Owner only | `auth.uid() = owner_id` |
| INSERT | Owner only (personal) | `auth.uid() = owner_id AND type = 'personal'` |
| UPDATE | Owner only (personal) | `auth.uid() = owner_id AND type = 'personal'` |
| DELETE | Owner only (personal) | `auth.uid() = owner_id AND type = 'personal'` |

---

### session_exercises

| Operation | Allowed | Condition |
|---|---|---|
| SELECT | Same visibility as parent training_session | via JOIN |
| INSERT / UPDATE / DELETE | Owner of parent personal session only | via JOIN to training_sessions |

---

### muscle_groups

| Operation | Allowed | Condition |
|---|---|---|
| SELECT | All authenticated | Reference data |
| INSERT / UPDATE / DELETE | Service role only | `false` |

---

### equipment

| Operation | Allowed | Condition |
|---|---|---|
| SELECT | All authenticated | Reference data |
| INSERT / UPDATE / DELETE | Service role only | `false` |

---

### exercises

| Operation | Allowed | Condition |
|---|---|---|
| SELECT | All authenticated | Reference data |
| INSERT / UPDATE / DELETE | Service role only | `false` |

---

### workout_executions

| Operation | Allowed | Condition |
|---|---|---|
| SELECT | Own records only | `auth.uid() = user_id` |
| INSERT | Own records only | `auth.uid() = user_id` |
| UPDATE | Own in-progress records only | `auth.uid() = user_id AND status = 'in_progress'` |
| DELETE | Never | `false` — historical records must be preserved |

---

### workout_exercise_executions

| Operation | Allowed | Condition |
|---|---|---|
| SELECT | Owner of parent workout_execution | via JOIN |
| INSERT | Owner of parent workout_execution | via JOIN |
| UPDATE | Owner of parent workout_execution | via JOIN |
| DELETE | Never | `false` |

---

### workout_sets

| Operation | Allowed | Condition |
|---|---|---|
| SELECT | Owner of parent workout_execution | via JOIN chain |
| INSERT | Owner of parent workout_execution | via JOIN chain |
| UPDATE | Owner of parent workout_execution | via JOIN chain |
| DELETE | Never | `false` |

---

### calendar_events

| Operation | Allowed | Condition |
|---|---|---|
| SELECT | Own records only | `auth.uid() = user_id` |
| INSERT | Service role only | `false` — auto-generated from active program |
| UPDATE | Service role only | `false` — updated by backend when workout completes |
| DELETE | Service role only | `false` |

---

### user_stats

| Operation | Allowed | Condition |
|---|---|---|
| SELECT | All authenticated | Public — needed for rankings and social features |
| INSERT | Service role only | `false` |
| UPDATE | Service role only | `false` — updated by Edge Functions after each workout |
| DELETE | Never | `false` |

---

### friend_requests

| Operation | Allowed | Condition |
|---|---|---|
| SELECT | Sender or receiver | `auth.uid() = sender_id OR auth.uid() = receiver_id` |
| INSERT | Own sender_id only | `auth.uid() = sender_id` |
| UPDATE (accept/reject) | Receiver only, pending only | `auth.uid() = receiver_id AND status = 'pending'` |
| DELETE (cancel) | Sender only, pending only | `auth.uid() = sender_id AND status = 'pending'` |

---

### friendships

| Operation | Allowed | Condition |
|---|---|---|
| SELECT | Participants only | `auth.uid() = user_a_id OR auth.uid() = user_b_id` |
| INSERT | Service role only | `false` — created by Edge Function on request acceptance |
| UPDATE | Never | `false` |
| DELETE | Participants only | `auth.uid() = user_a_id OR auth.uid() = user_b_id` |

---

### ranking_snapshots

| Operation | Allowed | Condition |
|---|---|---|
| SELECT | All authenticated | Public — rankings are visible to all users |
| INSERT / UPDATE / DELETE | Service role only | `false` — managed by Edge Functions |

---

### achievements

| Operation | Allowed | Condition |
|---|---|---|
| SELECT | All authenticated | Reference data |
| INSERT / UPDATE / DELETE | Service role only | `false` |

---

### user_achievements

| Operation | Allowed | Condition |
|---|---|---|
| SELECT | All authenticated | Public — needed for profile display |
| INSERT | Service role only | `false` — unlocked by Edge Functions |
| UPDATE / DELETE | Never | `false` |

---

### health_connections

| Operation | Allowed | Condition |
|---|---|---|
| SELECT | Own records only | `auth.uid() = user_id` |
| INSERT | Own records only | `auth.uid() = user_id` |
| UPDATE | Own records only | `auth.uid() = user_id` |
| DELETE | Own records only | `auth.uid() = user_id` |

---

### coach_clients (Future)

| Operation | Allowed | Condition |
|---|---|---|
| SELECT | Coach or client | `auth.uid() = coach_id OR auth.uid() = client_id` |
| INSERT / UPDATE / DELETE | Coach only | `auth.uid() = coach_id` |

---

## Ownership via JOIN

Tables whose ownership must be resolved through parent tables (program_days, session_exercises, workout_exercise_executions, workout_sets) require helper functions to avoid N+1 policy checks.

Use `SECURITY DEFINER` functions:

```sql
CREATE OR REPLACE FUNCTION owns_training_session(p_session_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM training_sessions
    WHERE id = p_session_id
    AND owner_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION owns_workout_execution(p_execution_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM workout_executions
    WHERE id = p_execution_id
    AND user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER;
```

---

## Service Role Contract

The `service_role` key must:

* Be stored exclusively as an environment variable in Edge Functions.
* Never be included in the mobile application bundle.
* Never be returned to any client.
* Be the only mechanism used for operations that bypass RLS (stats updates, ranking generation, calendar event management, subscription validation, achievement unlocking).
