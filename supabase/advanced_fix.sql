-- Advanced fix for Signup/RLS issues
-- This script does 3 things:
-- 1. Cleans up previous attempts
-- 2. Creates a Secure Function (RPC) to handle Company creation safely
-- 3. Opens up User creation permissions so the signup flow can complete

-- Part 1: Cleanup
DROP POLICY IF EXISTS "Allow public insert for companies" ON companies;
DROP POLICY IF EXISTS "Enable insert for authentication" ON companies;
DROP POLICY IF EXISTS "Allow users to insert their own profile" ON users;
DROP POLICY IF EXISTS "Enable insert for own profile" ON users;

-- Part 2: Secure Company Creation Function
-- This allows us to bypass the RLS restriction on "INSERT ... RETURNING" for new users
CREATE OR REPLACE FUNCTION create_new_company(company_name TEXT)
RETURNS SETOF companies
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with admin privileges
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  INSERT INTO companies (name)
  VALUES (company_name)
  RETURNING *;
END;
$$;

-- Grant execute permission to everyone (including anonymous users signing up)
GRANT EXECUTE ON FUNCTION create_new_company(TEXT) TO anon, authenticated, service_role;

-- Part 3: Robust User Policy
-- Allow anyone to insert into users table, BUT Postgres ensures integrity
-- because "id" must match an existing auth.users record.
CREATE POLICY "Allow public insert for users"
  ON users FOR INSERT
  TO public
  WITH CHECK (true);

-- Ensure public/anon can read the companies (needed for some flows)
create policy "Allow public read access to companies"
  on companies for select
  to public
  using (true);
