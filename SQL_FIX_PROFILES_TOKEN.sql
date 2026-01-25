-- 1. Add fcm_token to PROFILES table (User)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS fcm_token text;

-- 2. Ensure RLS Policy allows users to UPDATE their own profile
-- (Drop first to avoid conflicts if it exists with different name)
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 3. Verify Drivers also have it (Just in case)
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS fcm_token text;
