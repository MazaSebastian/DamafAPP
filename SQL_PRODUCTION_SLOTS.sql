-- 1. Create table for production slots (templates)
CREATE TABLE IF NOT EXISTS production_slots (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    start_time TIME NOT NULL,
    end_time TIME, -- Optional, usually start_time + 15m
    max_orders INTEGER DEFAULT 5,
    is_delivery BOOLEAN DEFAULT TRUE,
    is_takeaway BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Add slot_id to orders table to link confirmed orders to a slot
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS slot_id UUID REFERENCES production_slots(id),
ADD COLUMN IF NOT EXISTS slot_time TEXT; -- Snapshot of time in case slot config changes

-- 3. Enable RLS
ALTER TABLE production_slots ENABLE ROW LEVEL SECURITY;

-- 4. Policies
-- Allow public read access (for checkout)
CREATE POLICY "Public slots are viewable by everyone" 
ON production_slots FOR SELECT 
USING (true);

-- Allow admins full access
CREATE POLICY "Admins can manage slots" 
ON production_slots FOR ALL 
USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- 5. Helper function to check availability (Optional, but useful for frontend)
-- We can do this in JS, but a view/function is cleaner.
-- For now, we will handle capacity logic in the frontend query for simplicity.
