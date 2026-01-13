-- NUCLEAR UNBLOCK SCRIPT
-- This script resets policies to the absolute simplest state to guarantee the app loads.

-- 1. PROFILES TABLE (The root of the issue)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Wipe slate clean
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can see own profile" ON public.profiles;

-- SIMPLEST SAFE POLICIES
-- Read/Write Own Data ONLY. No Admin checks (prevents recursion).
-- If an Admin needs to see all, they can currently use the Dashboard which might bypass RLS 
-- via service role, or we fix admin access later. Priority is UNBLOCKING THE HOME.
CREATE POLICY "Unblock_Read_Own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Unblock_Update_Own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Unblock_Insert_Own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);


-- 2. NEWS TABLE (The likely secondary blocker)
ALTER TABLE public.news_events ENABLE ROW LEVEL SECURITY;

-- Wipe slate clean
DROP POLICY IF EXISTS "Everyone can read news" ON public.news_events;
DROP POLICY IF EXISTS "Admins can manage news" ON public.news_events;

-- SIMPLE PUBLIC READ
-- No admin checks in the SELECT policy. 
-- "true" means anyone can read. No DB queries to profiles table. Zero recursion risk.
CREATE POLICY "Unblock_Read_News" ON public.news_events FOR SELECT USING (true);

-- TEMPORARY WRITE (Secure this later if needed, or rely on just App Logic for now to unblock dev)
-- Only allow update if you are logged in (checking admin here causes recursion, so we skip it for now)
-- You can re-secure this later.
CREATE POLICY "Unblock_Write_News" ON public.news_events FOR ALL USING (auth.role() = 'authenticated');
