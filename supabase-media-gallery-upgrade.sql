-- Mt. Capistrano Masonic Lodge No. 23
-- Media gallery upgrade
-- Run this in the Supabase SQL Editor if media_posts already exists.

ALTER TABLE public.media_posts
  ADD COLUMN IF NOT EXISTS image_urls text[],
  ADD COLUMN IF NOT EXISTS storage_paths text[];

-- Seed existing single-image media rows into the new gallery columns.
UPDATE public.media_posts
SET image_urls = ARRAY[image_url]
WHERE image_urls IS NULL AND image_url IS NOT NULL;

UPDATE public.media_posts
SET storage_paths = ARRAY[storage_path]
WHERE storage_paths IS NULL AND storage_path IS NOT NULL;
