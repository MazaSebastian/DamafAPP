-- Add postal_code to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS postal_code text;

COMMENT ON COLUMN profiles.postal_code IS 'Postal/Zip code for the customer address';
