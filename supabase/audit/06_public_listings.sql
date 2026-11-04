-- =====================================================================
-- PHASE 3 - PUBLIC LISTINGS (read-only window for the public website)
--
-- What this does:
--   1. Adds properties.is_public (default FALSE = nothing is public).
--   2. Creates two views the public website reads:
--        public_listings         one row per listing you switched on
--        public_listing_photos   the photos of those listings
--      They expose ONLY safe columns. They do NOT contain: address,
--      postal code, listing agent, cobroke agent, remarks, brochure,
--      or anything else from your CRM.
--   3. Gives logged-out visitors (anon) SELECT on those two views ONLY.
--      The CRM tables stay locked exactly as after 03_enable_rls.sql.
--
-- Only listings with is_public = true AND status Available/Booked show.
-- Safe to run: nothing is deleted, no existing data changes.
-- Rollback is at the bottom of this file.
-- =====================================================================

begin;

alter table public.properties
  add column if not exists is_public boolean not null default false;

-- The view runs with its owner's rights on purpose (it is the ONLY way
-- visitors reach listing rows, and it only exposes the columns below).
create or replace view public.public_listings
with (security_invoker = false) as
select
  p.id,
  p.title,
  p.headline,
  p.category,
  p.purpose,
  p.price,
  p.status,
  p.area,
  p.city,
  p.state,
  p.property_type,
  p.property_sub_type,
  p.unit_type,
  p.bedrooms,
  p.bathrooms,
  p.built_up,
  p.land_size,
  p.tenure,
  p.title_type,
  p.furnishing,
  p.parking_spaces,
  p.facing,
  p.land_type,
  p.description,
  p.highlights
from public.properties p
where p.is_public = true
  and p.status in ('Available', 'Booked');

create or replace view public.public_listing_photos
with (security_invoker = false) as
select
  ph.id,
  ph.property_id,
  ph.photo_type,
  ph.image_url
from public.property_photos ph
join public.properties p on p.id = ph.property_id
where p.is_public = true
  and p.status in ('Available', 'Booked');

-- Visitors: read the two views, nothing else.
revoke all on public.public_listings       from public, anon, authenticated;
revoke all on public.public_listing_photos from public, anon, authenticated;
grant select on public.public_listings       to anon, authenticated;
grant select on public.public_listing_photos to anon, authenticated;

commit;

-- ---------------------------------------------------------------------
-- ROLLBACK (run separately if needed). Hides everything again and
-- removes the views; the is_public column and your data stay.
-- begin;
-- drop view if exists public.public_listing_photos;
-- drop view if exists public.public_listings;
-- commit;
-- ---------------------------------------------------------------------

-- ---------------------------------------------------------------------
-- HOW TO SHOW A LISTING (until the switch exists in the MIB form):
--   update public.properties set is_public = true where id = 123;
-- HOW TO HIDE IT AGAIN:
--   update public.properties set is_public = false where id = 123;
-- ---------------------------------------------------------------------
