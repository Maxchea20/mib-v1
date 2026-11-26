-- =====================================================================
-- NAMED WORKERS (Woody and Becky)
--
-- What this does:
--   Until now desktop_workers could hold only ONE row per user (the table
--   was unique on user_id). To have two named workers (Woody = posting,
--   Becky = listing intake), the rule changes to: one row per user AND NAME.
--   Your existing worker row is renamed to Woody and keeps its id, so its old
--   jobs still point to it.
--
-- Safe to run: no rows are deleted. It only (1) drops the "one row per user"
-- rule, (2) adds "one row per user and name", (3) renames the old row.
-- Rollback is at the bottom of this file.
-- =====================================================================

begin;

do $$
declare
  r record;
  uid_attnum smallint;
begin
  select attnum into uid_attnum
  from pg_attribute
  where attrelid = 'public.desktop_workers'::regclass and attname = 'user_id' and not attisdropped;

  -- a UNIQUE constraint on user_id alone
  for r in
    select conname from pg_constraint
    where conrelid = 'public.desktop_workers'::regclass and contype = 'u' and conkey = array[uid_attnum]
  loop
    execute format('alter table public.desktop_workers drop constraint %I', r.conname);
  end loop;

  -- a unique INDEX on user_id alone (not owned by a constraint)
  for r in
    select c.relname from pg_index i
    join pg_class c on c.oid = i.indexrelid
    where i.indrelid = 'public.desktop_workers'::regclass
      and i.indisunique and not i.indisprimary
      and i.indkey::text = uid_attnum::text
      and not exists (select 1 from pg_constraint k where k.conindid = i.indexrelid)
  loop
    execute format('drop index public.%I', r.relname);
  end loop;
end $$;

create unique index if not exists desktop_workers_user_name_idx
  on public.desktop_workers (user_id, worker_name);

update public.desktop_workers set worker_name = 'Woody' where worker_name = 'MIB Desktop';

commit;

-- ROLLBACK (only if you ever want to go back; first make sure only one row per user exists):
--   drop index if exists public.desktop_workers_user_name_idx;
--   alter table public.desktop_workers add constraint desktop_workers_user_id_key unique (user_id);
