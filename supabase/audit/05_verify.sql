-- =====================================================================
-- VERIFY after 03_enable_rls.sql. Run each block SEPARATELY in the SQL
-- editor. Each one changes nothing (rolled back).
-- =====================================================================

-- TEST 1: logged-out visitor (anon key, no login).
-- EXPECTED: ERROR  permission denied for table properties
begin;
set local role anon;
select count(*) from public.properties;
rollback;

-- TEST 2: anonymous sign-in user (what the old desktop app was).
-- EXPECTED: count = 0   (cannot see any CRM row)
begin;
set local role authenticated;
select set_config('request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-000000000001","role":"authenticated","is_anonymous":true}', true);
select count(*) from public.properties;
select count(*) from public.buyers;
select count(*) from public.deals;
rollback;

-- TEST 3: anonymous user tries to write.
-- EXPECTED: ERROR  new row violates row-level security policy
begin;
set local role authenticated;
select set_config('request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-000000000001","role":"authenticated","is_anonymous":true}', true);
insert into public.facebook_groups (id) values (gen_random_uuid());
rollback;

-- TEST 4: the real MIB account.
-- EXPECTED: counts match your real data (properties about 104)
begin;
set local role authenticated;
select set_config('request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-000000000002","role":"authenticated","is_anonymous":false}', true);
select count(*) from public.properties;
select count(*) from public.buyers;
select count(*) from public.deals;
rollback;

-- TEST 5: RLS flags. EXPECTED: rls_enabled = true on all 13 rows
select relname, relrowsecurity as rls_enabled
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r'
order by relname;
