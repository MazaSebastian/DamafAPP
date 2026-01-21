-- Add notes column to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS notes TEXT;

COMMENT ON COLUMN orders.notes IS 'General order notes or observations';
