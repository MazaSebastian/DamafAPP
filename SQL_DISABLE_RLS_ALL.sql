-- EMERGENCY RECOVERY SCRIPT
-- This script DISABLES Row Level Security (RLS) completely on critical tables.
-- This removes ALL permission checks. Use only for debugging/recovery.

-- 1. Disable RLS on Profiles (Fixes User Loading/Name)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 2. Disable RLS on News (Fixes Home Feed)
ALTER TABLE public.news_events DISABLE ROW LEVEL SECURITY;

-- 3. Disable RLS on other potential blockers (Just in case)
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;

-- After running this, the app SHOULD load immediately.
-- If it still doesn't load, the database itself might be down/paused.
