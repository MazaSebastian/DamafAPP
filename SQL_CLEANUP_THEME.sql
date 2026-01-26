-- Remove unwanted theme settings
DELETE FROM app_settings 
WHERE key IN ('theme_border_radius', 'theme_font_family', 'theme_font_size_root');
