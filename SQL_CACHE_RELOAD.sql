-- Force PostgREST to reload the schema cache
-- This is necessary when columns are added/removed and the API doesn't pick it up immediately.

NOTIFY pgrst, 'reload schema';
