-- =====================================================================
-- SHARE LOG (for the Marketing > Today page)
--
-- What this does:
--   Creates public.share_log: one row each time you tick "Posted" for a
--   listing (or a tip idea) on a platform. The Today page uses it to
--   rotate what to share next and to show how long ago a listing was shared.
--
-- Safe to run: it only ADDS one new table. No existing data changes.
-- Same lock-down as the other CRM tables (03_enable_rls.sql):
--   logged-out visitors get nothing, logged-in owner gets normal access.
-- Rollback is at the bottom of this file.
-- =====================================================================

begin;

create table if not exists public.share_log (
  id          bigint generated always as identity primary key,
  property_id bigint,                       -- the listing shared (null for a tip idea)
  idea_key    text,                         -- which tip idea was shared (null for a listing)
  platform    text   not null,              -- instagram, tiktok, threads, xiaohongshu, douyin, facebook, whatsapp
  lang        text,                         -- en, ms, zh
  shared_at   timestamptz not null default now(),
  constraint share_log_one_target check (property_id is not null or idea_key is not null)
);

create index if not exists share_log_property_idx on public.share_log (property_id, shared_at desc);
create index if not exists share_log_shared_at_idx on public.share_log (shared_at desc);

alter table public.share_log enable row level security;

revoke all on public.share_log from anon;
revoke truncate, references, trigger on public.share_log from authenticated;

drop policy if exists mib_owner_only on public.share_log;
create policy mib_owner_only on public.share_log
  for all to authenticated
  using      ((select auth.jwt() ->> 'is_anonymous') is distinct from 'true')
  with check ((select auth.jwt() ->> 'is_anonymous') is distinct from 'true');

commit;

-- ROLLBACK (only if you ever want to remove it):
--   drop table if exists public.share_log;
