-- Add first_name and last_name columns if they don't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS first_name text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_name text;

-- Populate first_name and last_name from full_name for existing records
-- Logic: Split by the first space. Everything before is first_name, everything after is last_name.
UPDATE profiles
SET 
  first_name = split_part(full_name, ' ', 1),
  last_name = substring(full_name from position(' ' in full_name) + 1)
WHERE first_name IS NULL AND full_name IS NOT NULL;

-- Handle case where there is no space (only first name)
UPDATE profiles
SET 
  first_name = full_name,
  last_name = ''
WHERE first_name IS NULL AND full_name IS NOT NULL AND position(' ' in full_name) = 0;
