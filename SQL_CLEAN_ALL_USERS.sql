-- ⚠️ DANGER: THIS DELETES ALL USERS AND DATA
-- Run this to reset the database for production testing

BEGIN;

-- 1. Clean Public Tables (Order matters because of dependencies)
DELETE FROM redemptions;
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM profiles; -- This might be empty already

-- 2. Clean Auth Users
-- This will trigger the deletion of any remaining linked data if CASCADE is set up,
-- but doing step 1 first ensures no foreign key blocks.
DELETE FROM auth.users;

COMMIT;
