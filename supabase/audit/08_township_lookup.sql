-- =====================================================================
-- TOWNSHIP LOOKUP (township -> city + postal code)
--
-- What this does:
--   Creates public.township_lookup. The listing form saves one row each
--   time you save a listing with a township, city and postal code. Next
--   time you pick that township, city and postal code fill themselves.
--
-- Safe to run: it only ADDS one new table. No existing data changes.
-- Same lock-down as the other CRM tables (logged-in owner only).
-- Rollback: drop table if exists public.township_lookup;
-- =====================================================================

begin;

create table if not exists public.township_lookup (
  township    text primary key,   -- stored lower-case and trimmed
  label       text not null,      -- the township as you typed it (display)
  state       text,
  city        text,
  postal_code text not null,
  updated_at  timestamptz not null default now()
);

alter table public.township_lookup enable row level security;

revoke all on public.township_lookup from anon;
revoke truncate, references, trigger on public.township_lookup from authenticated;

drop policy if exists mib_owner_only on public.township_lookup;
create policy mib_owner_only on public.township_lookup
  for all to authenticated
  using      ((select auth.jwt() ->> 'is_anonymous') is distinct from 'true')
  with check ((select auth.jwt() ->> 'is_anonymous') is distinct from 'true');

commit;
