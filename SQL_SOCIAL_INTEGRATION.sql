-- 1. Create table for Social Media Messages
create table if not exists social_messages (
    id uuid default uuid_generate_v4() primary key,
    platform text not null, -- 'instagram', 'facebook', 'whatsapp'
    external_id text unique, -- Message ID from Meta
    sender_id text not null, -- PSI (Page Scoped ID)
    recipient_id text not null, -- Our Page ID
    message_text text,
    media_url text, -- For images/files
    direction text not null CHECK (direction IN ('incoming', 'outgoing')), 
    status text default 'received', -- 'received', 'read', 'replied'
    created_at timestamp with time zone default now(),
    raw_data jsonb -- Full payload for debugging
);

-- 2. Enable RLS (Optional, depending on your security model)
alter table social_messages enable row level security;

-- Allow authenticated users (admins) to view and manage messages
create policy "Admins can view social messages"
    on social_messages for select
    to authenticated
    using (true);

create policy "Admins can insert social messages"
    on social_messages for insert
    to authenticated
    with check (true);

create policy "Admins can update social messages"
    on social_messages for update
    to authenticated
    using (true);
    
-- Allow Service Role (Edge Functions) full access (implicitly allowed, but good to note)


-- 3. Add Instagram Credentials to Settings
INSERT INTO app_settings (key, value, description) VALUES
('instagram_access_token', '', 'Instagram Graph API Access Token (Long-Lived)'),
('instagram_verify_token', 'damaf_secure_token_123', 'Token de verificación para el Webhook (Crea uno propio)'),
('instagram_page_id', '', 'Instagram Professional Account ID')
ON CONFLICT (key) DO NOTHING;
