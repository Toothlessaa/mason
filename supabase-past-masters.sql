-- Past Masters table for Mt. Capistrano Masonic Lodge No. 23
-- Run this SQL in your Supabase SQL editor to create the table.

CREATE TABLE IF NOT EXISTS public.past_masters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  title text,
  year_served text,
  image_url text,
  storage_path text,
  bio text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  sort_order bigint NOT NULL DEFAULT 0,
  created_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS past_masters_status_sort_idx
  ON public.past_masters (status, sort_order ASC, created_at ASC);

-- Enable row level security
ALTER TABLE public.past_masters ENABLE ROW LEVEL SECURITY;

-- Public can read published past masters
CREATE POLICY "Public can read published past masters"
  ON public.past_masters FOR SELECT
  USING (status = 'published');

-- Anon can read all past masters (for admin panel)
CREATE POLICY "Anon can read past masters for admin"
  ON public.past_masters FOR SELECT
  USING (true);

-- Anon can create past masters
CREATE POLICY "Anon can create past masters"
  ON public.past_masters FOR INSERT
  WITH CHECK (true);

-- Anon can update past masters
CREATE POLICY "Anon can update past masters"
  ON public.past_masters FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Anon can delete past masters
CREATE POLICY "Anon can delete past masters"
  ON public.past_masters FOR DELETE
  USING (true);
