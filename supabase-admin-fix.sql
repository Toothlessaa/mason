-- Mt. Capistrano Masonic Lodge No. 23
-- Admin credentials fix (2026-08)
-- Run this in the Supabase SQL Editor of project:
--   https://supabase.com/dashboard/project/peuyvjkwebgvczxrlnjt/sql/new
-- (This is the project the deployed website actually connects to!)

-- The app connects with the anon key. RLS was enabled on members with no
-- policies, so the app could not see or insert any row -> login always failed.
ALTER TABLE members DISABLE ROW LEVEL SECURITY;

-- Fix existing admin password (noel@gmail.com / adminadmin1234)
UPDATE members SET password = '$2b$10$OpBFktPpwyZNGUDKrbS7O.0cOitZ2J0oeALGrGGL2YU73IOzuzLRu' WHERE email = 'noel@gmail.com';

-- Add new admin (admin@mcml23.com / ChangeMe123!)
INSERT INTO members (name, role, email, password, status, is_freemason, is_admin)
VALUES ('Admin', 'Administrator', 'admin@mcml23.com', '$2b$10$SuaohE5TftrTxjMt5V.9WO4.TdZOFcY8y9/8UrGYSfALpS.OhNaCe', 'Active', NULL, true)
ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password, is_admin = EXCLUDED.is_admin, status = EXCLUDED.status, role = EXCLUDED.role;

-- Verify: should list all members
SELECT email, role, is_admin, status FROM members ORDER BY email;