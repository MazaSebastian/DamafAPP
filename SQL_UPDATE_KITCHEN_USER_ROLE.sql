-- Actualizar el rol del usuario damafacocina@gmail.com a 'kitchen'
-- Primero verificamos el usuario actual
SELECT id, email, role FROM profiles WHERE email = 'damafacocina@gmail.com';

-- Actualizamos el rol a 'kitchen'
UPDATE profiles 
SET role = 'kitchen' 
WHERE email = 'damafacocina@gmail.com';

-- Verificamos el cambio
SELECT id, email, role FROM profiles WHERE email = 'damafacocina@gmail.com';
