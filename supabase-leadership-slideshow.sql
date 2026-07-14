-- Mt. Capistrano Masonic Lodge No. 23
-- Leadership slideshow setup
-- Run this in the Supabase SQL Editor after supabase-media-cms.sql.

CREATE TABLE IF NOT EXISTS public.leadership_slides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  storage_path text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  sort_order bigint NOT NULL DEFAULT 0,
  created_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS leadership_slides_status_sort_idx
  ON public.leadership_slides (status, sort_order ASC, created_at ASC);

-- Reuse the existing public media bucket for slideshow images.
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- The current app uses its own client-side admin session, not Supabase Auth.
-- These policies match the existing media CMS approach.
ALTER TABLE public.leadership_slides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read published leadership slides" ON public.leadership_slides;
CREATE POLICY "Public can read published leadership slides"
  ON public.leadership_slides FOR SELECT
  USING (status = 'published');

DROP POLICY IF EXISTS "Anon can read leadership slides for admin" ON public.leadership_slides;
CREATE POLICY "Anon can read leadership slides for admin"
  ON public.leadership_slides FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Anon can create leadership slides" ON public.leadership_slides;
CREATE POLICY "Anon can create leadership slides"
  ON public.leadership_slides FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anon can update leadership slides" ON public.leadership_slides;
CREATE POLICY "Anon can update leadership slides"
  ON public.leadership_slides FOR UPDATE
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anon can delete leadership slides" ON public.leadership_slides;
CREATE POLICY "Anon can delete leadership slides"
  ON public.leadership_slides FOR DELETE
  USING (true);

DROP POLICY IF EXISTS "Public can read media images" ON storage.objects;
CREATE POLICY "Public can read media images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'media');

DROP POLICY IF EXISTS "Anon can upload media images" ON storage.objects;
CREATE POLICY "Anon can upload media images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'media');

DROP POLICY IF EXISTS "Anon can delete media images" ON storage.objects;
CREATE POLICY "Anon can delete media images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'media');
