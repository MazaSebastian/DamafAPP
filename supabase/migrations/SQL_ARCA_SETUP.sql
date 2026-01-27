-- Create table for AFIP Credentials (One row per environment/setup)
CREATE TABLE IF NOT EXISTS public.afip_credentials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    environment TEXT NOT NULL DEFAULT 'production', -- 'testing' or 'production'
    cuit TEXT NOT NULL,
    sales_point INT NOT NULL,
    cert_crt TEXT NOT NULL, -- Encrypted or plain? ideally secure, but start with text
    private_key TEXT NOT NULL, -- Encrypted highly recommended
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.afip_credentials ENABLE ROW LEVEL SECURITY;

-- Create policy (Admin only)
CREATE POLICY "Admin can full access afip_credentials" ON public.afip_credentials
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'owner')
        )
    );

-- Create table for AFIP Auth Tokens (WSAA)
CREATE TABLE IF NOT EXISTS public.afip_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    environment TEXT NOT NULL,
    token TEXT NOT NULL,
    sign TEXT NOT NULL,
    expiration_time TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.afip_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can full access afip_tokens" ON public.afip_tokens
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'owner')
        )
    );

-- Create table for Invoices
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id), -- Link to internal order
    cae TEXT,
    cae_due_date DATE,
    cbte_tipo INT NOT NULL, -- 1=Factura A, 6=Factura B, 11=Factura C
    cbte_nro BIGINT,
    pt_vta INT NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    doc_tipo INT DEFAULT 99, -- 99=Sin Identificar, 80=CUIT, 96=DNI
    doc_nro TEXT DEFAULT '0',
    status TEXT DEFAULT 'pending', -- pending, authorized, rejected
    error_msg TEXT,
    pdf_url TEXT,
    afip_response JSONB, -- Store full response for debugging
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.invoices DISABLE ROW LEVEL SECURITY;

-- Users can view their own invoices? Maybe later.
