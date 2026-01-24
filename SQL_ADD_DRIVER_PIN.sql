-- Add PIN Code for simple driver authentication
ALTER TABLE public.drivers 
ADD COLUMN IF NOT EXISTS pin_code text DEFAULT '1234'; -- Default PIN for migration

-- Ensure it's not null in future
ALTER TABLE public.drivers 
ALTER COLUMN pin_code SET DEFAULT '0000';
