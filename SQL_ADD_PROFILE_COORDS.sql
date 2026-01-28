-- Add coordinates to profiles for precise delivery location
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS lat float8;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS lng float8;

COMMENT ON COLUMN profiles.lat IS 'Saved delivery latitude';
COMMENT ON COLUMN profiles.lng IS 'Saved delivery longitude';
