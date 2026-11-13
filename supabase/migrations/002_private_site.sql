-- Migration 002: make the whole site private, add Resume and Photography.
-- Run once in Supabase → SQL Editor, AFTER the new site version is deployed.

-- 1. Nothing is readable with the public (publishable) key any more.
--    Viewers' pages are rendered on the server with the secret key, after the
--    server has checked their login. Editors can still read via their own session.
drop policy if exists "profile readable by all" on public.profile;
drop policy if exists "profile readable by editors" on public.profile;
create policy "profile readable by editors" on public.profile
  for select using (public.is_editor());

drop policy if exists "public articles readable" on public.articles;
drop policy if exists "articles readable by editors" on public.articles;
create policy "articles readable by editors" on public.articles
  for select using (public.is_editor());

-- 2. Per-article privacy is gone: the whole site is behind a login now.
alter table public.articles drop column if exists visibility;

-- 3. Resume PDF (stored in the private "documents" bucket).
alter table public.profile add column if not exists resume_path text;

-- 4. Photography.
create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  file_path text not null,
  caption text,
  width int,
  height int,
  created_at timestamptz not null default now()
);

alter table public.photos enable row level security;

drop policy if exists "editors read photos" on public.photos;
create policy "editors read photos" on public.photos
  for select using (public.is_editor());
drop policy if exists "editors insert photos" on public.photos;
create policy "editors insert photos" on public.photos
  for insert with check (public.is_editor());
drop policy if exists "editors update photos" on public.photos;
create policy "editors update photos" on public.photos
  for update using (public.is_editor()) with check (public.is_editor());
drop policy if exists "editors delete photos" on public.photos;
create policy "editors delete photos" on public.photos
  for delete using (public.is_editor());

-- 5. Profile photo and photography images: private bucket, served via short-lived signed links.
update storage.buckets set public = false where id = 'site-public';
