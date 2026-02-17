
ALTER TABLE public.publications
  ADD COLUMN IF NOT EXISTS authors text,
  ADD COLUMN IF NOT EXISTS publisher text,
  ADD COLUMN IF NOT EXISTS indexing text[],
  ADD COLUMN IF NOT EXISTS volume_issue text,
  ADD COLUMN IF NOT EXISTS pages text,
  ADD COLUMN IF NOT EXISTS publication_date date,
  ADD COLUMN IF NOT EXISTS pub_type text;
