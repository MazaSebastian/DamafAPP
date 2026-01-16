-- Verificar y agregar políticas RLS para que kitchen pueda ver productos y perfiles
-- Esto es necesario para que los JOINs funcionen en la consulta del KDS

-- Primero, verificar políticas existentes
SELECT schemaname, tablename, policyname, roles, cmd 
FROM pg_policies 
WHERE tablename IN ('products', 'profiles')
ORDER BY tablename, policyname;

-- Si no hay políticas para kitchen en products, agregarlas
DO $$ 
BEGIN
    -- Drop existing policy if exists
    DROP POLICY IF EXISTS "Everyone can view products" ON products;
    
    -- Create new policy allowing everyone to view products
    CREATE POLICY "Everyone can view products" ON products 
    FOR SELECT 
    USING (true);
    
    -- For profiles, kitchen users should be able to see basic profile info
    DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
    
    CREATE POLICY "Public profiles are viewable by everyone" ON profiles 
    FOR SELECT 
    USING (true);
END $$;

-- Verificar que las políticas se crearon
SELECT schemaname, tablename, policyname, roles, cmd 
FROM pg_policies 
WHERE tablename IN ('products', 'profiles')
ORDER BY tablename, policyname;
