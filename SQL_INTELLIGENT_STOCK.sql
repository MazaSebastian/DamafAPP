-- 1. Create Ingredients Table (Raw Materials)
CREATE TABLE IF NOT EXISTS ingredients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    unit TEXT DEFAULT 'g', -- g, kg, ml, u
    stock FLOAT DEFAULT 0,
    min_stock FLOAT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Create Product Recipes Table (Linking Products to Ingredients)
CREATE TABLE IF NOT EXISTS product_recipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    ingredient_id UUID REFERENCES ingredients(id) ON DELETE CASCADE,
    quantity FLOAT NOT NULL, -- Amount of ingredient used per 1 unit of product
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(product_id, ingredient_id)
);

-- 3. RLS Policies
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_recipes ENABLE ROW LEVEL SECURITY;

-- Public Read (for checking availability if needed, or just admin)
-- Actually, maybe we only need Admin to see this. But let's allow public read for safety in edge cases.
CREATE POLICY "Public Read Ingredients" ON ingredients FOR SELECT USING (true);
CREATE POLICY "Public Read Recipes" ON product_recipes FOR SELECT USING (true);

-- Admin Full Access
CREATE POLICY "Admin Full Access Ingredients" ON ingredients FOR ALL USING (auth.role() = 'service_role' OR auth.email() = 'damafapp@gmail.com');
CREATE POLICY "Admin Full Access Recipes" ON product_recipes FOR ALL USING (auth.role() = 'service_role' OR auth.email() = 'damafapp@gmail.com');

-- 4. Trigger Function to Deduct Stock
CREATE OR REPLACE FUNCTION deduct_stock_on_order()
RETURNS TRIGGER AS $$
DECLARE
    item RECORD;
    recipe RECORD;
BEGIN
    -- Only run if status changes to 'cooking' (Kitchen accepts) OR if it's created as 'cooking'/'completed' immediately?
    -- Strategy: Run when order is inserted if it goes straight to Kitchen, OR when updated to 'cooking'.
    -- BUT, we must ensure we don't deduct twice.
    -- Better Strategy: Deduct when order is CREATED (pending or paid). If cancelled, we replenish.
    -- Let's stick to: Deduct when Inserted into order_items?
    -- No, trigger needs to be on order status or order creation.
    
    -- Let's use a trigger on `order_items`. When an item is added, we deduct.
    -- If order is cancelled later, we'd need another trigger to replenish.
    
    -- LOOP through recipes for this product
    FOR recipe IN 
        SELECT * FROM product_recipes WHERE product_id = NEW.product_id
    LOOP
        -- Update Ingredient Stock
        UPDATE ingredients 
        SET stock = stock - (recipe.quantity * NEW.quantity)
        WHERE id = recipe.ingredient_id;
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Attach Trigger to order_items
DROP TRIGGER IF EXISTS tr_deduct_stock ON order_items;

CREATE TRIGGER tr_deduct_stock
AFTER INSERT ON order_items
FOR EACH ROW
EXECUTE FUNCTION deduct_stock_on_order();

-- 6. Trigger to Replenish on Order Cancel (Optional but recommended)
CREATE OR REPLACE FUNCTION replenish_stock_on_cancel()
RETURNS TRIGGER AS $$
DECLARE
    item RECORD;
    recipe RECORD;
BEGIN
    -- If Order Status changes to 'cancelled'
    IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
        -- Find all items in this order
        FOR item IN SELECT * FROM order_items WHERE order_id = NEW.id LOOP
            -- Loop recipes for each item
            FOR recipe IN SELECT * FROM product_recipes WHERE product_id = item.product_id LOOP
                UPDATE ingredients 
                SET stock = stock + (recipe.quantity * item.quantity)
                WHERE id = recipe.ingredient_id;
            END LOOP;
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_replenish_stock ON orders;

CREATE TRIGGER tr_replenish_stock
AFTER UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION replenish_stock_on_cancel();
