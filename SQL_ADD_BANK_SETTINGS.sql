INSERT INTO app_settings (key, value, description) VALUES
('bank_cbu', '', 'CBU/CVU para transferencias'),
('bank_alias', '', 'Alias para transferencias'),
('bank_holder', '', 'Titular de la cuenta'),
('bank_name', '', 'Nombre del Banco/Billetera')
ON CONFLICT (key) DO NOTHING;

NOTIFY pgrst, 'reload schema';
