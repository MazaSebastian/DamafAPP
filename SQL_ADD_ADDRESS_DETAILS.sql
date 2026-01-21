-- Add address details to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS postal_code text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS floor text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS department text;

COMMENT ON COLUMN profiles.postal_code IS 'Postal/Zip code for the customer address';
COMMENT ON COLUMN profiles.floor IS 'Floor number (Piso) for delivery';
COMMENT ON COLUMN profiles.department IS 'Department/Apartment (Departamento) for delivery';
