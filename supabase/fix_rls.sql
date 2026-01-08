-- Fix for infinite recursion in RLS policies

-- 1. Create a secure function to get the current user's company_id
-- This function runs with SECURITY DEFINER to bypass RLS, preventing recursion
CREATE OR REPLACE FUNCTION get_auth_user_company_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT company_id 
    FROM users 
    WHERE id = auth.uid()
  );
END;
$$;

-- 2. Create a secure function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM users
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$;

-- 3. Drop existing problematic policies on users table
DROP POLICY IF EXISTS "Users can view users in their company" ON users;
DROP POLICY IF EXISTS "Admins can insert users in their company" ON users;
DROP POLICY IF EXISTS "Admins can update users in their company" ON users;
DROP POLICY IF EXISTS "Admins can delete users in their company" ON users;

-- 4. Re-create policies using the secure functions

CREATE POLICY "Users can view users in their company"
  ON users FOR SELECT
  USING (
    company_id = get_auth_user_company_id()
  );

CREATE POLICY "Admins can insert users in their company"
  ON users FOR INSERT
  WITH CHECK (
    company_id = get_auth_user_company_id()
    AND is_admin()
  );

CREATE POLICY "Admins can update users in their company"
  ON users FOR UPDATE
  USING (
    company_id = get_auth_user_company_id()
    AND is_admin()
  );

CREATE POLICY "Admins can delete users in their company"
  ON users FOR DELETE
  USING (
    company_id = get_auth_user_company_id()
    AND is_admin()
  );
