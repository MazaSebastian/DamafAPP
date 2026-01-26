-- Drop the existing strict constraint
ALTER TABLE coupons
DROP CONSTRAINT IF EXISTS coupons_target_product_id_fkey;

-- Re-add the constraint with ON DELETE CASCADE
-- This ensures that if a product is deleted (e.g. via Category deletion), 
-- any coupons linked specifically to that product are also deleted.
ALTER TABLE coupons
ADD CONSTRAINT coupons_target_product_id_fkey
FOREIGN KEY (target_product_id)
REFERENCES products(id)
ON DELETE CASCADE;
