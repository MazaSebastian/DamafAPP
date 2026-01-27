
-- Add client_phone column to orders table to store contact info for guests (and snapshot for users)
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS client_phone TEXT;

-- Optional: Backfill for existing orders using guest_info if available? 
-- No, let's just leave it null for old orders.
