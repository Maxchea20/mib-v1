-- =====================================================================
-- TOWNSHIP LOOKUP: key by township + city
--
-- Why: the same township name exists in several cities (for example
-- "Taman Sepakat", "Taman Cahaya") with different postcodes. Keying by
-- township alone makes one city overwrite another.
--
-- Run AFTER 08_township_lookup.sql. Safe: it only changes the key of
-- public.township_lookup. Existing rows are kept (blank city becomes '').
-- =====================================================================

begin;

update public.township_lookup set city = '' where city is null;

alter table public.township_lookup alter column city set default '';
alter table public.township_lookup alter column city set not null;

alter table public.township_lookup drop constraint if exists township_lookup_pkey;
alter table public.township_lookup add primary key (township, city);

commit;
