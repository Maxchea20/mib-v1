-- =====================================================================
-- VLOG (for the Vlog page on maxproperty.my and the Vlog screen in MIB)
--
-- What this does:
--   1. Creates public.vlog_videos: one row per YouTube video you add
--      (the video address, titles and descriptions in English / BM / Chinese,
--      an optional listing it is about, order, and a show/hide switch).
--      Locked down like every other CRM table (owner only).
--   2. Creates the view public.public_vlog_videos that the website reads.
--      It shows only videos you switched on, and only the safe columns.
--      The listing link is given only when that listing is itself public.
--   3. Gives logged-out visitors (anon) SELECT on that view and nothing else.
--
-- The videos stay on YouTube: nothing is stored in Supabase, so they do not
-- use your Supabase storage or data allowance.
--
-- Safe to run: it only ADDS one table and one view. Rollback is at the bottom.
-- =====================================================================

begin;

create table if not exists public.vlog_videos (
  id           bigint generated always as identity primary key,
  youtube_id   text   not null,
  title_en     text,
  title_ms     text,
  title_zh     text,
  desc_en      text,
  desc_ms      text,
  desc_zh      text,
  property_id  bigint,
  sort_order   integer not null default 0,
  is_public    boolean not null default true,
  created_at   timestamptz not null default now(),
  constraint vlog_youtube_id_format check (youtube_id ~ '^[A-Za-z0-9_-]{11}$'),
  constraint vlog_has_title check (coalesce(title_en, title_ms, title_zh) is not null)
);

create unique index if not exists vlog_videos_youtube_id_key on public.vlog_videos (youtube_id);
create index if not exists vlog_videos_order_idx on public.vlog_videos (sort_order, id desc);

alter table public.vlog_videos enable row level security;

revoke all on public.vlog_videos from anon;
revoke truncate, references, trigger on public.vlog_videos from authenticated;

drop policy if exists mib_owner_only on public.vlog_videos;
create policy mib_owner_only on public.vlog_videos
  for all to authenticated
  using      ((select auth.jwt() ->> 'is_anonymous') is distinct from 'true')
  with check ((select auth.jwt() ->> 'is_anonymous') is distinct from 'true');

create or replace view public.public_vlog_videos
with (security_invoker = false) as
select
  v.id,
  v.youtube_id,
  v.title_en, v.title_ms, v.title_zh,
  v.desc_en, v.desc_ms, v.desc_zh,
  case when p.id is not null and p.is_public = true and p.status in ('Available', 'Booked')
       then v.property_id end as property_id,
  v.sort_order,
  v.created_at
from public.vlog_videos v
left join public.properties p on p.id = v.property_id
where v.is_public = true;

revoke all on public.public_vlog_videos from public, anon, authenticated;
grant select on public.public_vlog_videos to anon, authenticated;

commit;

-- ---------------------------------------------------------------------
-- ROLLBACK (run separately if you ever want to remove it):
-- begin;
-- drop view if exists public.public_vlog_videos;
-- drop table if exists public.vlog_videos;
-- commit;
-- ---------------------------------------------------------------------
