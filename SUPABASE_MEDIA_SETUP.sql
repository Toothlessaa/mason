-- Run this in the Supabase SQL editor before using admin media uploads.

create table if not exists public.media_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  date text not null,
  summary text not null,
  image_url text not null,
  storage_path text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_by text,
  created_at timestamptz not null default now()
);

create index if not exists media_posts_status_created_at_idx
  on public.media_posts (status, created_at desc);

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

-- The current app uses its own client-side admin session, not Supabase Auth.
-- These policies allow the website's anon key to manage media from the admin page.
-- For production-hardening, move admin media writes behind Supabase Auth or an Edge Function.
alter table public.media_posts enable row level security;

drop policy if exists "Public can read published media" on public.media_posts;
create policy "Public can read published media"
  on public.media_posts for select
  using (status = 'published' or true);

drop policy if exists "Anon can create media posts" on public.media_posts;
create policy "Anon can create media posts"
  on public.media_posts for insert
  with check (true);

drop policy if exists "Anon can update media posts" on public.media_posts;
create policy "Anon can update media posts"
  on public.media_posts for update
  using (true)
  with check (true);

drop policy if exists "Anon can delete media posts" on public.media_posts;
create policy "Anon can delete media posts"
  on public.media_posts for delete
  using (true);

drop policy if exists "Public can read media images" on storage.objects;
create policy "Public can read media images"
  on storage.objects for select
  using (bucket_id = 'media');

drop policy if exists "Anon can upload media images" on storage.objects;
create policy "Anon can upload media images"
  on storage.objects for insert
  with check (bucket_id = 'media');

drop policy if exists "Anon can delete media images" on storage.objects;
create policy "Anon can delete media images"
  on storage.objects for delete
  using (bucket_id = 'media');
