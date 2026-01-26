-- Insert default appearance settings
-- Removed: Font Family, Border Radius
-- Added: Text Colors, Font Size
INSERT INTO app_settings (key, value, description) VALUES
('theme_color_primary', '#3a0861', 'Color principal (Botones, Acentos)'),
('theme_color_secondary', '#d64322', 'Color secundario'),
('theme_color_background', '#302c64', 'Color de fondo global'),
('theme_color_surface', '#3b3678', 'Color de tarjetas y contenedores'),
('theme_color_text_main', '#ffffff', 'Color de texto principal'),
('theme_color_text_muted', '#94a3b8', 'Color de texto secundario'),
('theme_font_size_root', '16px', 'Tamaño base de fuente (px)'),
('theme_logo_url', '/logo-damaf.png', 'URL del logotipo de la aplicación')
ON CONFLICT (key) DO NOTHING;
