-- Propagate user metadata to profiles table on creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    role, 
    full_name,
    first_name, -- attempt to split if needed, or just leave null and let application handle display fallback
    phone,
    address,
    floor,
    department,
    postal_code
  )
  VALUES (
    new.id, 
    new.email, 
    'user',
    new.raw_user_meta_data->>'full_name',
    split_part(new.raw_user_meta_data->>'full_name', ' ', 1), -- Basic split for first_name
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'address',
    new.raw_user_meta_data->>'floor',
    new.raw_user_meta_data->>'department',
    new.raw_user_meta_data->>'postal_code'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
