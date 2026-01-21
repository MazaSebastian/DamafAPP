-- Drop the existing foreign key constraint on order_items
-- Note: usage of specific constraint name 'order_items_order_id_fkey' is assumed default by Supabase/Postgres.
-- If the name is different, this might fail, but this is the standard naming convention.

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'order_items_order_id_fkey' 
        AND table_name = 'order_items'
    ) THEN
        ALTER TABLE order_items DROP CONSTRAINT order_items_order_id_fkey;
    END IF;
END $$;

-- Re-add the constraint with ON DELETE CASCADE
ALTER TABLE order_items
ADD CONSTRAINT order_items_order_id_fkey
FOREIGN KEY (order_id)
REFERENCES orders(id)
ON DELETE CASCADE;
