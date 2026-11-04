-- =====================================================================
-- MIB V2 - PHASE 1 SUPABASE SECURITY AUDIT (READ-ONLY)
-- Paste into: Supabase Dashboard > SQL Editor > New query > Run.
-- Changes NOTHING. It only reads catalog tables.
-- Returns ONE result set (section, item, detail). Export it as CSV or
-- copy the whole grid and paste it back to Claude.
-- =====================================================================

select * from (

-- 1. Tables in public: is RLS on?
select '1 TABLES' as section,
       c.relname as item,
       'rls_enabled=' || c.relrowsecurity
         || ' rls_forced=' || c.relforcerowsecurity
         || ' approx_rows=' || c.reltuples::bigint as detail
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind in ('r','p')

union all
-- 2. Every RLS policy in public
select '2 POLICIES',
       p.tablename || ' :: ' || p.policyname,
       'cmd=' || p.cmd || ' roles=' || p.roles::text
         || ' USING=' || coalesce(p.qual, '-')
         || ' CHECK=' || coalesce(p.with_check, '-')
from pg_policies p
where p.schemaname = 'public'

union all
-- 3. Table privileges held by anon / authenticated in public
select '3 GRANTS',
       t.table_name,
       t.grantee || ': ' || string_agg(t.privilege_type, ',' order by t.privilege_type)
from information_schema.role_table_privileges t
where t.table_schema = 'public' and t.grantee in ('anon','authenticated')
group by t.table_name, t.grantee

union all
-- 4. Views in public (views bypass RLS unless security_invoker)
select '4 VIEWS',
       c.relname,
       'security_invoker=' || coalesce((select option_value from pg_options_to_table(c.reloptions) where option_name = 'security_invoker'), 'false(default = runs as owner, BYPASSES RLS)')
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind in ('v','m')

union all
-- 5. Functions in public (SECURITY DEFINER runs as owner)
select '5 FUNCTIONS',
       p.proname || '(' || pg_get_function_identity_arguments(p.oid) || ')',
       'security_definer=' || p.prosecdef
         || ' config=' || coalesce(p.proconfig::text, 'none')
         || ' execute_anon=' || has_function_privilege('anon', p.oid, 'execute')
         || ' execute_authenticated=' || has_function_privilege('authenticated', p.oid, 'execute')
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'

union all
-- 6. Storage buckets
select '6 BUCKETS',
       b.id,
       'public=' || b.public
         || ' size_limit=' || coalesce(b.file_size_limit::text, 'none')
         || ' mime=' || coalesce(b.allowed_mime_types::text, 'any')
from storage.buckets b

union all
-- 7. Storage policies (on storage.objects)
select '7 STORAGE POLICIES',
       p.policyname,
       'cmd=' || p.cmd || ' roles=' || p.roles::text
         || ' USING=' || coalesce(p.qual, '-')
         || ' CHECK=' || coalesce(p.with_check, '-')
from pg_policies p
where p.schemaname = 'storage' and p.tablename = 'objects'

union all
-- 8. Auth users: how many real vs anonymous (counts only, no emails)
select '8 AUTH USERS',
       case when u.is_anonymous then 'anonymous' else 'real_account' end,
       'count=' || count(*)
from auth.users u
group by u.is_anonymous

union all
-- 9. Definition of the job-claim function (to review its authorization)
select '9 CLAIM FUNCTION',
       p.proname,
       pg_get_functiondef(p.oid)
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.proname = 'claim_next_desktop_job'

) q
order by section, item;
