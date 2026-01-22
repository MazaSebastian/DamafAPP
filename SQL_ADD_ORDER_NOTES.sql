-- Add notes column to orders table if it doesn't exist
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Reload Schema Cache
NOTIFY pgrst, 'reload schema';
