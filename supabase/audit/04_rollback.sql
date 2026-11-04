-- Emergency rollback of 03_enable_rls.sql: returns the tables to the
-- previous (open) state so MIB works again while we investigate.
begin;
do $$
declare t text;
begin
  foreach t in array array[
    'ai_designs','ai_video_projects','ai_videos','buyers','clients',
    'deals','desktop_jobs','desktop_workers','facebook_groups',
    'properties','property_photos','timelines'
  ] loop
    execute format('drop policy if exists mib_owner_only on public.%I', t);
    execute format('alter table public.%I disable row level security', t);
    execute format('grant all on public.%I to anon, authenticated', t);
  end loop;
end $$;
commit;
