-- =====================================================================
-- PHASE 1 / STEP 2 - TURN ON RLS FOR ALL CRM TABLES
--
-- DO NOT RUN until BOTH are true:
--   1. The new MIB web app (branch claude/phase1-rls-prep) is deployed.
--      (Its server pages used a cookie-less client that only worked
--       because RLS was off.)
--   2. MIB Desktop (branch claude/desktop-owner-login) is installed and
--      you have signed in once with your MIB email + password.
--
-- Result: only a real (non-anonymous) logged-in account can read or
-- write CRM data. Logged-out visitors and anonymous sign-ins get
-- nothing. The service-role API routes are not affected (they bypass
-- RLS on the server). Nothing is deleted. Rollback: 04_rollback.sql
-- =====================================================================

begin;

do $$
declare
  t text;
  pol record;
  tables text[] := array[
    'ai_designs','ai_video_projects','ai_videos','buyers','clients',
    'deals','desktop_jobs','desktop_workers','facebook_groups',
    'properties','property_photos','timelines'
  ];
begin
  foreach t in array tables loop
    -- remove old policies (only exist on desktop_* tables)
    for pol in select policyname from pg_policies
               where schemaname = 'public' and tablename = t loop
      execute format('drop policy %I on public.%I', pol.policyname, t);
    end loop;

    execute format('alter table public.%I enable row level security', t);

    -- logged-out visitors: no direct table access at all
    execute format('revoke all on public.%I from anon', t);
    -- the logged-in role keeps normal CRUD but loses TRUNCATE etc.
    execute format('revoke truncate, references, trigger on public.%I from authenticated', t);

    execute format($f$
      create policy mib_owner_only on public.%I
        for all to authenticated
        using      ((select auth.jwt() ->> 'is_anonymous') is distinct from 'true')
        with check ((select auth.jwt() ->> 'is_anonymous') is distinct from 'true')
    $f$, t);
  end loop;
end $$;

-- property_images already has RLS on and no policies (blocks everyone):
-- also remove its open grants.
revoke all on public.property_images from anon;
revoke truncate, references, trigger on public.property_images from authenticated;

commit;
