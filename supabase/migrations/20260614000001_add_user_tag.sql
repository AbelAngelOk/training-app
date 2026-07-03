ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS tag varchar(30),
  ADD COLUMN IF NOT EXISTS tag_updated_at timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_profiles_tag
  ON public.user_profiles (tag)
  WHERE tag IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_profiles_tag_lower
  ON public.user_profiles (lower(tag))
  WHERE tag IS NOT NULL;
