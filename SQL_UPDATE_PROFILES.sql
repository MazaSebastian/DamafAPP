-- Add new columns to profiles for User Account settings
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS birth_date date;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS zip_code text;

-- Add RLS policies for update
-- Policy "Users can update own profile" already exists in SQL_SETUP, so skipping.
-- CREATE POLICY "Users can update own profile" ON profiles
--    FOR UPDATE USING (auth.uid() = id);
    
-- Note: Email is handled by auth.users, but we can't edit it easily from here without auth API.
-- User requested immutable email anyway.
