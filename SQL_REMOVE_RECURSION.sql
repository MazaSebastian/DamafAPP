-- FINAL FIX FOR RECURSIVE RLS DEADLOCK
-- The previous Admin policy caused an infinite loop (Profile -> Check Admin -> Read Profile -> Check Admin...)

-- 1. Remove the dangerous recursive policy
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;

-- 2. Ensure the SAFE policy exists and is the ONLY one for SELECT
-- (Users can ONLY see their own profile data)
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- 3. Ensure News is readable by everyone (Public)
DROP POLICY IF EXISTS "Everyone can read news" ON public.news_events;
CREATE POLICY "Everyone can read news" 
ON public.news_events FOR SELECT 
TO public
USING (true);

-- This guarantees NO recursion. fast and safe.
