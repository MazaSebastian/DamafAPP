-- Add coordinates columns to orders table if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'delivery_lat') THEN
        ALTER TABLE orders ADD COLUMN delivery_lat double precision;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'delivery_lng') THEN
        ALTER TABLE orders ADD COLUMN delivery_lng double precision;
    END IF;
END $$;
