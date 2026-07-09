
DO $$
DECLARE
  project_url text := 'https://peuyvjkwebgvczxrlnjt.supabase.co';
BEGIN
  IF project_url = 'https://YOUR-PROJECT.supabase.co' THEN
    RAISE EXCEPTION 'Replace project_url in supabase-seed-hardcoded-media.sql before running.';
  END IF;

  CREATE TEMP TABLE seed_media_posts (
    title text,
    category text,
    media_date text,
    summary text,
    storage_file text
  ) ON COMMIT DROP;

  INSERT INTO seed_media_posts (title, category, media_date, summary, storage_file)
  VALUES
    ('Installation of Officers', 'Ceremony', '2026', 'A dignified gathering honoring continuity, responsibility, and leadership.', 'fir.jpg'),
    ('Community Service in Bukidnon', 'Community', '2026', 'Brethren extending relief and visible service beyond the lodge room.', 'community.png'),
    ('Fellowship Night', 'Brotherhood', '2026', 'A night of harmony, renewal, and fraternal connection.', 'fellow2.jpg'),
    ('Lodge Milestones', 'Announcement', '2026', 'Selected updates and milestones from Mt. Capistrano Masonic Lodge No. 23.', 'milestone.jpg'),
    ('Charity and Relief Work', 'Community', '2026', 'Documenting acts of service inspired by brotherly love and relief.', 'charity.jpg'),
    ('Ceremonial Highlights', 'Ceremony', '2026', 'Moments preserved with dignity, discretion, and institutional pride.', 's.jpg'),
    ('Brotherhood in Action', 'Brotherhood', '2026', 'A visual record of fellowship, unity, and the bond shared among brethren.', 'brotherhood.jpg');

  INSERT INTO public.media_posts (
    title,
    category,
    date,
    summary,
    image_url,
    image_urls,
    storage_path,
    storage_paths,
    status,
    created_by
  )
  SELECT
    seed.title,
    seed.category,
    seed.media_date,
    seed.summary,
    project_url || '/storage/v1/object/public/media/' || objects.name,
    ARRAY[project_url || '/storage/v1/object/public/media/' || objects.name],
    objects.name,
    ARRAY[objects.name],
    'published',
    'Seed'
  FROM seed_media_posts seed
  JOIN LATERAL (
    SELECT name
    FROM storage.objects
    WHERE bucket_id = 'media'
      AND (
        lower(name) = lower(seed.storage_file)
        OR lower(name) LIKE '%' || lower(seed.storage_file)
      )
    ORDER BY created_at DESC
    LIMIT 1
  ) objects ON true
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.media_posts existing
    WHERE lower(existing.title) = lower(seed.title)
  );
END $$;
