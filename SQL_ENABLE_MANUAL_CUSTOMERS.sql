-- SQL Migration to enable Manual Customer Creation (Ghost Profiles)
-- This script removes the strict dependency between profiles.id and auth.users.id
-- allowing us to create profiles that do not have a login account (e.g. in-person customers).

-- 1. Drop the existing foreign key constraint
-- Note: The exact constraint name might vary, but it is typically 'profiles_id_fkey'
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'profiles_id_fkey'
        AND table_name = 'profiles'
    ) THEN
        ALTER TABLE profiles DROP CONSTRAINT profiles_id_fkey;
    END IF;
END $$;

-- 2. Set strict foreign key is removed, we still want to ensure ID is generated if not provided
ALTER TABLE profiles ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- 3. (Optional) We can add a loose foreign key or just rely on the application logic.
-- Ideally, we'd add a separate 'auth_user_id' column if we wanted to maintain a link for real users 
-- while allowing the PK 'id' to be independent, but that is a larger refactor.
-- For now, 'id' will match 'auth.users.id' for real users (via the handle_new_user trigger)
-- and be a random UUID for manual customers.

-- Note on Cascade Delete:
-- Previously, deleting a user from auth.users would cascade delete the profile.
-- Now, since the constraint is gone, deleting a user in auth.users might leave the profile.
-- If you want to maintain cascade delete for real users, you would need a trigger, 
-- but for "ghost" users it doesn't matter.

COMMENT ON TABLE profiles IS 'Profiles for both registered app users and manually created customers.';
