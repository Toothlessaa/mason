-- Mt. Capistrano Masonic Lodge No. 23
-- Media CMS setup
-- Run this in the Supabase SQL Editor after supabase-schema.sql.

CREATE TABLE IF NOT EXISTS public.media_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL,
  date text NOT NULL,
  summary text NOT NULL,
  image_url text NOT NULL,
  image_urls text[],
  storage_path text,
  storage_paths text[],
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_by text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.media_posts
  ADD COLUMN IF NOT EXISTS image_urls text[],
  ADD COLUMN IF NOT EXISTS storage_paths text[];

UPDATE public.media_posts
SET image_urls = ARRAY[image_url]
WHERE image_urls IS NULL AND image_url IS NOT NULL;

UPDATE public.media_posts
SET storage_paths = ARRAY[storage_path]
WHERE storage_paths IS NULL AND storage_path IS NOT NULL;

CREATE INDEX IF NOT EXISTS media_posts_status_created_at_idx
  ON public.media_posts (status, created_at DESC);

INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- The current app uses its own client-side admin session, not Supabase Auth.
-- These policies allow the website's anon key to manage media from the admin page.
-- For production-hardening, move admin media writes behind Supabase Auth or an Edge Function.
ALTER TABLE public.media_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read published media" ON public.media_posts;
CREATE POLICY "Public can read published media"
  ON public.media_posts FOR SELECT
  USING (status = 'published');

DROP POLICY IF EXISTS "Anon can read media posts for admin" ON public.media_posts;
CREATE POLICY "Anon can read media posts for admin"
  ON public.media_posts FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Anon can create media posts" ON public.media_posts;
CREATE POLICY "Anon can create media posts"
  ON public.media_posts FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anon can update media posts" ON public.media_posts;
CREATE POLICY "Anon can update media posts"
  ON public.media_posts FOR UPDATE
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anon can delete media posts" ON public.media_posts;
CREATE POLICY "Anon can delete media posts"
  ON public.media_posts FOR DELETE
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
