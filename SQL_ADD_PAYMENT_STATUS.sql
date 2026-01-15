-- Add payment confirmation status
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT false;

-- Update existing orders to be paid (assumed) so we don't break flow for old ones
UPDATE orders SET is_paid = true WHERE status IN ('completed', 'cancelled', 'rejected');

-- Pending orders remain is_paid = false by default unless manually updated
