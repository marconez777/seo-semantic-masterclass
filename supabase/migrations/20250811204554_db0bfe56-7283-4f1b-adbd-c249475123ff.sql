-- Delete all existing backlink sites
BEGIN;
  DELETE FROM public.backlinks;
COMMIT;