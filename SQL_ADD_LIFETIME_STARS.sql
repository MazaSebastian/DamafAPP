-- 1. Add lifetime_stars column to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS lifetime_stars integer DEFAULT 0;

-- 2. Backfill existing data
-- For existing users, assume their current stars are their lifetime stars (best guess)
-- If they spent stars, we can't recover that history without a 'spent' log, but this is a good start.
UPDATE profiles 
SET lifetime_stars = stars 
WHERE lifetime_stars = 0 OR lifetime_stars IS NULL;

-- 3. Update the Trigger Function
-- When an order is completed, we add stars to BOTH 'stars' (current wallet) and 'lifetime_stars' (historical total)
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
        -- Logic: 10 stars per $1. Round down.
        stars_to_add := floor(NEW.final_total * 10);
        
        UPDATE profiles 
        SET 
            stars = stars + stars_to_add,
            lifetime_stars = COALESCE(lifetime_stars, 0) + stars_to_add
        WHERE id = NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$;
