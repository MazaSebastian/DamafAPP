-- Create Modifiers Table
CREATE TABLE IF NOT EXISTS modifiers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    category TEXT, -- e.g., 'Extra', 'Opcion', 'Salsa'
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Junction Table: Product <-> Modifiers
-- Allows a specific list of modifiers per product.
-- If we want "All Burgers" to have "Extra Bacon", we might handle that in UI logic or bulk insert here.
CREATE TABLE IF NOT EXISTS product_modifiers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    modifier_id UUID REFERENCES modifiers(id) ON DELETE CASCADE,
    is_required BOOLEAN DEFAULT false, -- If true, user MUST pick? (Maybe for 'Cooking Point')
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(product_id, modifier_id)
);

-- Junction Table: Product <-> Modifiers (Option B: Category based)
-- Can be useful if ALL items in category 'Hamburguesas' get these modifiers.
-- For now, let's stick to product-level for granular control, but maybe add category_modifiers logic later if needed.

-- Add RLS policies (Open for read, Admin for write)
ALTER TABLE modifiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_modifiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON modifiers FOR SELECT USING (true);
CREATE POLICY "Enable insert for admins only" ON modifiers FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'owner')));
CREATE POLICY "Enable update for admins only" ON modifiers FOR UPDATE USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'owner')));
CREATE POLICY "Enable delete for admins only" ON modifiers FOR DELETE USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'owner')));

CREATE POLICY "Enable read access for all users" ON product_modifiers FOR SELECT USING (true);
CREATE POLICY "Enable insert for admins only" ON product_modifiers FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'owner')));
CREATE POLICY "Enable delete for admins only" ON product_modifiers FOR DELETE USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'owner')));
