-- STARBUCKS MODEL MIGRATION SCRIPT

-- 1. Add columns for Loyalty System
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS lifetime_stars integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS birth_date date;

-- 2. Update Trigger to "1 Star per $100" (Starbucks Scale)
CREATE OR REPLACE FUNCTION add_stars_on_order_complete()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    stars_to_add integer;
BEGIN
    -- Only run if status changed to 'completed'
    IF NEW.status = 'completed' AND OLD.status != 'completed' AND NEW.user_id IS NOT NULL THEN
        -- New Logic: 1 star per $100. Round down.
        stars_to_add := floor(NEW.final_total / 100);
        
        -- Prevent adding 0 stars if purchase < 100 (optional, but fair)
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

-- 3. ECONOMY MIGRATION (Divide by 1000)
-- Old: 10 stars / $1  -> New: 0.01 stars / $1
-- Factor: 1000
UPDATE profiles 
SET 
    stars = floor(stars / 1000),
    lifetime_stars = floor(COALESCE(lifetime_stars, stars) / 1000);
