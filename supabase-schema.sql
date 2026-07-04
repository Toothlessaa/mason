-- Mt. Capistrano Masonic Lodge No. 23
-- Run this in the Supabase SQL Editor

-- ==========================================
-- Migration (run if table already exists)
-- ==========================================
ALTER TABLE members DROP COLUMN IF EXISTS auth_user_id CASCADE;
ALTER TABLE members ADD COLUMN IF NOT EXISTS password text;
ALTER TABLE members ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;
ALTER TABLE members ALTER COLUMN is_freemason TYPE text USING is_freemason::text;
ALTER TABLE members ALTER COLUMN is_freemason SET DEFAULT NULL;
ALTER TABLE members DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS members_select ON members;
DROP POLICY IF EXISTS members_insert ON members;
DROP POLICY IF EXISTS members_update_own ON members;

-- ==========================================
-- Members table (for fresh creation)
-- ==========================================
CREATE TABLE IF NOT EXISTS members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL DEFAULT 'Pending Member',
  email text NOT NULL UNIQUE,
  password text,
  phone text,
  address text,
  member_since text,
  status text NOT NULL DEFAULT 'Pending'
    CHECK (status IN ('Pending', 'Active', 'Honorary', 'Probationary', 'Rejected')),
  is_freemason text DEFAULT NULL,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- ==========================================
-- Seed admin: noel@gmail.com / adminadmin1234
-- ==========================================
INSERT INTO members (name, role, email, password, phone, address, member_since, status, is_freemason, is_admin)
VALUES (
  'Noel Tan',
  'Worshipful Master',
  'noel@gmail.com',
  '$2b$10$4ynSoCrdC25POPzQWrhw3eCALKvkXtMICTHzJhJH/YYuaBYZbnqB.',
  '+63 912 345 6789',
  '123 Main St, Manila, Philippines',
  '2024-01-15',
  'Active',
  'Yes, raised in 2005',
  true
)
ON CONFLICT (email) DO UPDATE SET
  password = EXCLUDED.password,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  status = EXCLUDED.status,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  member_since = EXCLUDED.member_since,
  is_freemason = EXCLUDED.is_freemason,
  is_admin = EXCLUDED.is_admin;
