-- Drop the existing constraint that might be outdated or incorrect
ALTER TABLE public.submissions DROP CONSTRAINT IF EXISTS submissions_stage_check;

-- Add the correctly defined constraint matching the application code
ALTER TABLE public.submissions
  ADD CONSTRAINT submissions_stage_check
  CHECK (stage IN ('just-an-idea', 'building-mvp', 'launched-no-users', 'some-users', 'revenue'));
