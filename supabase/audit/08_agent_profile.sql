-- =====================================================================
-- AGENT PROFILE (for "My profile" in MIB and the About page on maxproperty.my)
--
-- What this does:
--   1. Creates public.agent_profile: ONE row (id = 1) holding your public
--      profile: name, short headline and bio in English / BM / Chinese,
--      photo, what you specialise in, areas, languages, start year.
--      It is locked down like every other CRM table (owner only).
--   2. Creates the view public.public_agent_profile that the website reads.
--      It shows the row ONLY when you tick "Show on the website", and ONLY
--      the safe columns below (no timestamps, no internal fields).
--   3. Gives logged-out visitors (anon) SELECT on that view and nothing else.
--
-- Safe to run: it only ADDS one table and one view. No existing data changes.
-- Rollback is at the bottom of this file.
-- =====================================================================

begin;

create table if not exists public.agent_profile (
  id              smallint primary key default 1,
  display_name    text,
  headline_en     text,
  headline_ms     text,
  headline_zh     text,
  bio_en          text,
  bio_ms          text,
  bio_zh          text,
  photo_url       text,
  specialisations text[] not null default '{}',
  areas           text[] not null default '{}',
  languages       text[] not null default '{}',
  since_year      smallint,
  is_public       boolean not null default false,
  updated_at      timestamptz not null default now(),
  constraint agent_profile_single_row check (id = 1),
  constraint agent_profile_since_year check (since_year is null or (since_year between 1980 and 2100))
);

alter table public.agent_profile enable row level security;

revoke all on public.agent_profile from anon;
revoke truncate, references, trigger on public.agent_profile from authenticated;

drop policy if exists mib_owner_only on public.agent_profile;
create policy mib_owner_only on public.agent_profile
  for all to authenticated
  using      ((select auth.jwt() ->> 'is_anonymous') is distinct from 'true')
  with check ((select auth.jwt() ->> 'is_anonymous') is distinct from 'true');

-- The only thing visitors can read: the safe columns, and only when published.
create or replace view public.public_agent_profile
with (security_invoker = false) as
select
  p.display_name,
  p.headline_en, p.headline_ms, p.headline_zh,
  p.bio_en, p.bio_ms, p.bio_zh,
  p.photo_url,
  p.specialisations, p.areas, p.languages,
  p.since_year
from public.agent_profile p
where p.id = 1
  and p.is_public = true;

revoke all on public.public_agent_profile from public, anon, authenticated;
grant select on public.public_agent_profile to anon, authenticated;

commit;

-- ---------------------------------------------------------------------
-- ROLLBACK (run separately if you ever want to remove it):
-- begin;
-- drop view if exists public.public_agent_profile;
-- drop table if exists public.agent_profile;
-- commit;
-- ---------------------------------------------------------------------
