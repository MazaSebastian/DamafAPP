-- 1. Add columns to modifiers table
ALTER TABLE modifiers 
ADD COLUMN IF NOT EXISTS ingredient_id UUID REFERENCES ingredients(id),
ADD COLUMN IF NOT EXISTS quantity FLOAT DEFAULT 0;

-- 2. Update Trigger Function to include Modifiers deduction
CREATE OR REPLACE FUNCTION deduct_stock_on_order()
RETURNS TRIGGER AS $$
DECLARE
    recipe RECORD;
    mod_record RECORD;
    mod_item JSONB;
BEGIN
    -- A. Product Recipe Deduction (Existing)
    FOR recipe IN 
        SELECT * FROM product_recipes WHERE product_id = NEW.product_id
    LOOP
        UPDATE ingredients 
        SET stock = stock - (recipe.quantity * NEW.quantity)
        WHERE id = recipe.ingredient_id;
    END LOOP;

    -- B. Modifiers Deduction (New)
    -- NEW.modifiers is a JSONB array, e.g., [{"id": "...", "name": "...", "price": ...}, ...]
    IF NEW.modifiers IS NOT NULL AND jsonb_array_length(NEW.modifiers) > 0 THEN
        FOR mod_item IN SELECT * FROM jsonb_array_elements(NEW.modifiers)
        LOOP
            -- Get the ingredient info from the real modifiers table using the ID from JSON
            SELECT ingredient_id, quantity INTO mod_record 
            FROM modifiers 
            WHERE id = (mod_item->>'id')::UUID;
            
            IF FOUND AND mod_record.ingredient_id IS NOT NULL THEN
                UPDATE ingredients
                SET stock = stock - (mod_record.quantity * NEW.quantity)
                WHERE id = mod_record.ingredient_id;
            END IF;
        END LOOP;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
