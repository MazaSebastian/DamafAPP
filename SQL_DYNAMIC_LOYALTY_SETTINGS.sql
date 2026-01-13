-- 1. Insert Default Loyalty Settings
INSERT INTO app_settings (key, value, description) VALUES
('loyalty_earning_divisor', '100', 'Monto en pesos para ganar 1 estrella (Ej: 100 = 1 estrella cada $100)'),
('loyalty_level_green', '50', 'Estrellas necesarias para nivel Green'),
('loyalty_level_gold', '300', 'Estrellas necesarias para nivel Gold')
ON CONFLICT (key) DO NOTHING;

-- 2. Update Trigger to Read Settings Dynamically
CREATE OR REPLACE FUNCTION add_stars_on_order_complete()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    stars_to_add integer;
    earning_divisor integer;
BEGIN
    -- Only run if status changed to 'completed'
    IF NEW.status = 'completed' AND OLD.status != 'completed' AND NEW.user_id IS NOT NULL THEN
        
        -- Fetch divisor from settings (Default to 100 if not found)
        SELECT value::integer INTO earning_divisor 
        FROM app_settings 
        WHERE key = 'loyalty_earning_divisor';
        
        IF earning_divisor IS NULL OR earning_divisor = 0 THEN
            earning_divisor := 100; -- Fallback
        END IF;

        -- Calculate stars
        stars_to_add := floor(NEW.final_total / earning_divisor);
        
        -- Prevent adding 0 stars if purchase < divisor
        IF stars_to_add < 1 THEN
            stars_to_add := 0;
        END IF;
        
        UPDATE profiles 
        SET 
            stars = stars + stars_to_add,
            lifetime_stars = COALESCE(lifetime_stars, 0) + stars_to_add
        WHERE id = NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$;
