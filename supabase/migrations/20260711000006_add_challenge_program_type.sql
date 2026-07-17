-- =============================================================================
-- Migration: add 'challenge' value to program_type enum
-- Kept in its own migration/transaction: PostgreSQL forbids using a newly
-- added enum value in the same transaction that added it.
-- =============================================================================

ALTER TYPE public.program_type ADD VALUE IF NOT EXISTS 'challenge';
