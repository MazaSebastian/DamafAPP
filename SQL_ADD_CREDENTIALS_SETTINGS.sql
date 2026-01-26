-- Insert credential settings placeholders
-- Using secure descriptions
INSERT INTO app_settings (key, value, description) VALUES
('mp_public_key', '', 'Public Key de Mercado Pago (TEST-...)'),
('mp_access_token', '', 'Access Token de Mercado Pago (APP_USR-...)'),
('google_maps_api_key', '', 'API Key de Google Maps (Maps Javascript API)')
ON CONFLICT (key) DO NOTHING;
