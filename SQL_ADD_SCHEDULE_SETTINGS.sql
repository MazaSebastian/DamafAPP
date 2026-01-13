-- Add Settings for Automatic Schedule
INSERT INTO app_settings (key, value, description) VALUES
('store_mode', 'manual', 'Modo de operación: "manual" o "auto"'),
('store_schedule', '{"0":{"active":true,"start":"19:00","end":"23:00"},"1":{"active":false,"start":"19:00","end":"23:00"},"2":{"active":false,"start":"19:00","end":"23:00"},"3":{"active":true,"start":"19:00","end":"23:00"},"4":{"active":true,"start":"19:00","end":"23:59"},"5":{"active":true,"start":"19:00","end":"23:59"},"6":{"active":true,"start":"19:00","end":"23:59"}}', 'Horarios semanales en formato JSON (0=Domingo)')
ON CONFLICT (key) DO NOTHING;
