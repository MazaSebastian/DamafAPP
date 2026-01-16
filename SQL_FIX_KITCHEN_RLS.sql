-- Fix RLS policies to allow kitchen users to view orders
-- The current policies only allow 'admin' and 'owner' roles to view orders
-- Kitchen users need to see orders with status 'cooking'

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all order items" ON order_items;
-- Also drop the new policies if they already exist (fix for re-runs)
DROP POLICY IF EXISTS "Admins and Kitchen can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins and Kitchen can view all order items" ON order_items;

-- Recreate policies with kitchen role included
CREATE POLICY "Admins and Kitchen can view all orders" ON orders 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('admin', 'owner', 'kitchen')
    )
);

CREATE POLICY "Admins and Kitchen can view all order items" ON order_items 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('admin', 'owner', 'kitchen')
    )
);

-- Verify the changes
SELECT schemaname, tablename, policyname, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('orders', 'order_items')
ORDER BY tablename, policyname;
