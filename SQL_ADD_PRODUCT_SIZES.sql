-- Add price_double column to products table for "Double Size" option
ALTER TABLE products ADD COLUMN IF NOT EXISTS price_double DOUBLE PRECISION DEFAULT NULL;

COMMENT ON COLUMN products.price_double IS 'Price for the Double size variant. If NULL, product has no size options.';
