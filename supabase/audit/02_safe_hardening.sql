-- =====================================================================
-- PHASE 1 / STEP 1 - SAFE HARDENING (no app changes needed, run anytime)
-- Fixes things that nothing in MIB depends on:
--   a) anyone (even logged out) can upload/overwrite files in the
--      property-images bucket -> only the real MIB account may
--   b) the brochure bucket accepts uploads from anonymous accounts
--   c) helper/RPC functions callable by logged-out visitors
-- Public READ of property photos is kept (Phase 3 needs it).
-- Nothing is deleted. Rollback at the bottom.
-- =====================================================================

begin;

-- c) functions -------------------------------------------------------
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;

revoke execute on function public.claim_next_desktop_job(uuid) from public, anon;
grant  execute on function public.claim_next_desktop_job(uuid) to authenticated;

-- a) property-images: only the real (non-anonymous) account may write --
drop policy if exists "Allow Public Update 107eh68_0" on storage.objects;
drop policy if exists "Allow Public Upload 107eh68_0" on storage.objects;
drop policy if exists "mib_owner_insert_property_images" on storage.objects;
drop policy if exists "mib_owner_update_property_images" on storage.objects;
drop policy if exists "mib_owner_delete_property_images" on storage.objects;

create policy "mib_owner_insert_property_images" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'property-images'
              and (select auth.jwt() ->> 'is_anonymous') is distinct from 'true');

create policy "mib_owner_update_property_images" on storage.objects
  for update to authenticated
  using (bucket_id = 'property-images'
         and (select auth.jwt() ->> 'is_anonymous') is distinct from 'true')
  with check (bucket_id = 'property-images'
              and (select auth.jwt() ->> 'is_anonymous') is distinct from 'true');

create policy "mib_owner_delete_property_images" on storage.objects
  for delete to authenticated
  using (bucket_id = 'property-images'
         and (select auth.jwt() ->> 'is_anonymous') is distinct from 'true');

-- b) property-brochures: same rule ------------------------------------
drop policy if exists "Authenticated update for property-brochures" on storage.objects;
drop policy if exists "Authenticated upload for property-brochures" on storage.objects;
drop policy if exists "mib_owner_insert_property_brochures" on storage.objects;
drop policy if exists "mib_owner_update_property_brochures" on storage.objects;

create policy "mib_owner_insert_property_brochures" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'property-brochures'
              and (select auth.jwt() ->> 'is_anonymous') is distinct from 'true');

create policy "mib_owner_update_property_brochures" on storage.objects
  for update to authenticated
  using (bucket_id = 'property-brochures'
         and (select auth.jwt() ->> 'is_anonymous') is distinct from 'true')
  with check (bucket_id = 'property-brochures'
              and (select auth.jwt() ->> 'is_anonymous') is distinct from 'true');

commit;

-- ---------------------------------------------------------------------
-- ROLLBACK (only if something breaks; run separately):
-- begin;
-- drop policy if exists "mib_owner_insert_property_images" on storage.objects;
-- drop policy if exists "mib_owner_update_property_images" on storage.objects;
-- drop policy if exists "mib_owner_delete_property_images" on storage.objects;
-- drop policy if exists "mib_owner_insert_property_brochures" on storage.objects;
-- drop policy if exists "mib_owner_update_property_brochures" on storage.objects;
-- create policy "Allow Public Update 107eh68_0" on storage.objects for update to public using (bucket_id = 'property-images');
-- create policy "Allow Public Upload 107eh68_0" on storage.objects for insert to public with check (bucket_id = 'property-images');
-- create policy "Authenticated update for property-brochures" on storage.objects for update to authenticated using (bucket_id = 'property-brochures');
-- create policy "Authenticated upload for property-brochures" on storage.objects for insert to authenticated with check (bucket_id = 'property-brochures');
-- grant execute on function public.claim_next_desktop_job(uuid) to public;
-- grant execute on function public.rls_auto_enable() to public;
-- commit;
