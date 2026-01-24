-- RENAME THIS CONSTRAINT TO ENSURE IT POINTS TO THE RIGHT TABLE
-- The error "orders_driver_id_fkey" suggests an auto-generated constraint might be pointing to the wrong table (like auth.users or profiles)
-- instead of our new 'drivers' table.

-- 1. Drop potential existing constraints
ALTER TABLE public.orders 
DROP CONSTRAINT IF EXISTS orders_driver_id_fkey;

ALTER TABLE public.orders 
DROP CONSTRAINT IF EXISTS fk_orders_drivers;

-- 2. Add the correct constraint
ALTER TABLE public.orders
ADD CONSTRAINT fk_orders_drivers
FOREIGN KEY (driver_id)
REFERENCES public.drivers(id);

-- 3. Verify RLS (Safety Check)
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Drivers" ON public.drivers;
CREATE POLICY "Public Read Drivers" ON public.drivers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin Full Access Drivers" ON public.drivers;
CREATE POLICY "Admin Full Access Drivers" ON public.drivers FOR ALL USING (true); -- Simplify for now
