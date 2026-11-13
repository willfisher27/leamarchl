-- Lea Marchl portfolio — database schema.
-- Run this once in Supabase: Dashboard → SQL Editor → New query → paste → Run.

-- ─── Editors allowlist ────────────────────────────────────────────────
create table if not exists public.editors (
  email text primary key
);

-- Add both editor emails here (lowercase), then run.
-- insert into public.editors (email) values ('lea@example.com'), ('will@example.com');

create or replace function public.is_editor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.editors
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- ─── Profile (single row) ─────────────────────────────────────────────
create table if not exists public.profile (
  id int primary key default 1 check (id = 1),
  name text not null default 'Lea Marchl',
  title text not null default 'Reporter, Freedom of the Press Foundation',
  bio text not null default 'Lea Marchl is a reporter at Freedom of the Press Foundation. She previously worked at NewsGuard, Alethea Group, and the Middlebury Center on Terrorism, Extremism, and Counterterrorism.',
  experience text not null default E'Reporter — Freedom of the Press Foundation\nNewsGuard\nAlethea Group\nMiddlebury Center on Terrorism, Extremism, and Counterterrorism',
  photo_path text,
  email text,
  linkedin_url text,
  x_url text,
  bluesky_url text,
  updated_at timestamptz not null default now()
);

insert into public.profile (id) values (1) on conflict (id) do nothing;

-- ─── Articles ─────────────────────────────────────────────────────────
create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  outlet text,
  published_on date,
  summary text,
  kind text not null check (kind in ('link', 'pdf')),
  url text,
  file_path text,
  visibility text not null default 'public' check (visibility in ('public', 'private')),
  created_at timestamptz not null default now(),
  constraint article_has_target check (
    (kind = 'link' and url is not null) or (kind = 'pdf' and file_path is not null)
  )
);

create index if not exists articles_published_on_idx on public.articles (published_on desc);

-- ─── Row-level security ───────────────────────────────────────────────
alter table public.editors  enable row level security;  -- no policies: only server/definer access
alter table public.profile  enable row level security;
alter table public.articles enable row level security;

drop policy if exists "profile readable by all" on public.profile;
create policy "profile readable by all" on public.profile
  for select using (true);

drop policy if exists "profile editable by editors" on public.profile;
create policy "profile editable by editors" on public.profile
  for update using (public.is_editor()) with check (public.is_editor());

-- Anonymous visitors only ever see public rows. Private rows are fetched
-- server-side (service role) after the reader password cookie is verified.
drop policy if exists "public articles readable" on public.articles;
create policy "public articles readable" on public.articles
  for select using (visibility = 'public' or public.is_editor());

drop policy if exists "editors insert articles" on public.articles;
create policy "editors insert articles" on public.articles
  for insert with check (public.is_editor());

drop policy if exists "editors update articles" on public.articles;
create policy "editors update articles" on public.articles
  for update using (public.is_editor()) with check (public.is_editor());

drop policy if exists "editors delete articles" on public.articles;
create policy "editors delete articles" on public.articles
  for delete using (public.is_editor());

-- ─── Storage ──────────────────────────────────────────────────────────
-- site-public: profile photo (public URLs)
-- documents:   all PDFs (private; served via short-lived signed URLs after an access check)
insert into storage.buckets (id, name, public)
values ('site-public', 'site-public', true), ('documents', 'documents', false)
on conflict (id) do nothing;

drop policy if exists "editors read files" on storage.objects;
create policy "editors read files" on storage.objects
  for select to authenticated
  using (bucket_id in ('site-public', 'documents') and public.is_editor());

drop policy if exists "editors upload files" on storage.objects;
create policy "editors upload files" on storage.objects
  for insert to authenticated
  with check (bucket_id in ('site-public', 'documents') and public.is_editor());

drop policy if exists "editors update files" on storage.objects;
create policy "editors update files" on storage.objects
  for update to authenticated
  using (bucket_id in ('site-public', 'documents') and public.is_editor());

drop policy if exists "editors delete files" on storage.objects;
create policy "editors delete files" on storage.objects
  for delete to authenticated
  using (bucket_id in ('site-public', 'documents') and public.is_editor());
