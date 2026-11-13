-- Migration 003: group articles into sections (e.g. "NYC", "Iran", "Press freedom").
-- Run once in Supabase → SQL Editor.
alter table public.articles add column if not exists section text;
create index if not exists articles_section_idx on public.articles (section);
