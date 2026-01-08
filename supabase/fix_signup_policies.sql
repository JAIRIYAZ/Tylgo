-- Fix RLS policies to allow signup flow

-- 1. Policies for Companies
-- Allow anyone (public/anon) to create a new company during signup
CREATE POLICY "Allow public insert for companies"
  ON companies FOR INSERT
  WITH CHECK (true);

-- 2. Policies for Users
-- Allow authenticated users to create their own profile
CREATE POLICY "Allow users to insert their own profile"
  ON users FOR INSERT
  WITH CHECK (
    id = auth.uid()
  );

-- Note: The previous "Admins can insert users..." policy prevents self-registration
-- because the user doesn't exist yet to be an Admin.
-- The above policy is necessary for the first user of a company.
