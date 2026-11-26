-- =====================================================================
-- LISTING INTAKE (Facebook links from co-broke agents)
--
-- What this does:
--   Creates public.listing_intake: one row per Facebook post link you add
--   on the MIB "Listing intake" page, with the co-broke agent's name, and
--   where it is up to (saved, queued for the worker, running, done, failed).
--   When the worker finishes, property_id points to the DRAFT listing.
--
-- Safe to run: it only ADDS one new table. No existing data changes.
-- Same lock-down as the other CRM tables: logged-out visitors get nothing,
-- the logged-in owner gets normal access.
-- Rollback is at the bottom of this file.
-- =====================================================================

begin;

create table if not exists public.listing_intake (
  id            bigint generated always as identity primary key,
  source_url    text   not null,               -- the cleaned Facebook post link
  cobroke_agent text   not null,               -- who posted it (the co-broke agent)
  status        text   not null default 'saved'
                check (status in ('saved','queued','running','done','failed')),
  error         text,                          -- why it failed, in plain words
  property_id   bigint,                        -- the draft listing made from it
  job_id        text,                          -- the worker job that handles it
  created_at    timestamptz not null default now(),
  sent_at       timestamptz,
  finished_at   timestamptz
);

create unique index if not exists listing_intake_url_idx on public.listing_intake (source_url);
create index if not exists listing_intake_status_idx on public.listing_intake (status, created_at);

alter table public.listing_intake enable row level security;

revoke all on public.listing_intake from anon;
revoke truncate, references, trigger on public.listing_intake from authenticated;

drop policy if exists mib_owner_only on public.listing_intake;
create policy mib_owner_only on public.listing_intake
  for all to authenticated
  using      ((select auth.jwt() ->> 'is_anonymous') is distinct from 'true')
  with check ((select auth.jwt() ->> 'is_anonymous') is distinct from 'true');

commit;

-- ROLLBACK (only if you ever want to remove it):
--   drop table if exists public.listing_intake;
