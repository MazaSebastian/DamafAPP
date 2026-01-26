-- Update app_settings with the retrieved credentials from .env
-- This restores functionality for Maps and Checkout Frontend
UPDATE app_settings 
SET value = 'APP_USR-51a9264b-e007-40ea-89ec-aea916e37958' 
WHERE key = 'mp_public_key';

UPDATE app_settings 
SET value = 'AIzaSyCJx3LIqiKy6_HSiwaPp5sB0B1vMjBsmI4' 
WHERE key = 'google_maps_api_key';

-- Note: mp_access_token is kept as is (empty or previous) because it was not found in local .env
-- The Backend (Edge Function) currently still uses the Secret Environment Variable, so it should keep working.
