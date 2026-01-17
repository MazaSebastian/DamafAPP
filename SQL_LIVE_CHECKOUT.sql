-- Create table for realtime checkout sessions
CREATE TABLE IF NOT EXISTS checkout_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  status TEXT DEFAULT 'idle', -- 'idle', 'active', 'payment_success'
  cart_items JSONB DEFAULT '[]', -- Array of items being purchased
  subtotal NUMERIC DEFAULT 0,
  tax NUMERIC DEFAULT 0,
  total NUMERIC DEFAULT 0,
  payment_method TEXT,
  qr_code_url TEXT, -- If we want to dynamically send a QR
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable Realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE checkout_sessions;

-- Policy: Only authenticated users (admin) can update. Public (tablet) can read.
ALTER TABLE checkout_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read for checkout sessions" ON checkout_sessions
  FOR SELECT USING (true);

CREATE POLICY "Allow admin update checkout sessions" ON checkout_sessions
  FOR ALL USING (auth.role() = 'authenticated'); -- Assuming only admins are logged in users for now in this context, or refine by role.

-- Create a single singleton row if it doesn't exist, to simplify logic (we only have 1 POS)
INSERT INTO checkout_sessions (id, status)
SELECT '00000000-0000-0000-0000-000000000000', 'idle'
WHERE NOT EXISTS (SELECT 1 FROM checkout_sessions WHERE id = '00000000-0000-0000-0000-000000000000');
