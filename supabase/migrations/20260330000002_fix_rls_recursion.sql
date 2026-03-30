-- Fix infinite recursion in workspace RLS policies
-- The bug: workspaces_select_members queries workspace_members,
--          workspace_members_select_own queries workspaces → infinite loop

-- ── Step 1: Create a SECURITY DEFINER helper to check workspace ownership ──
-- This bypasses RLS entirely, breaking the circular dependency.

CREATE OR REPLACE FUNCTION is_workspace_owner(p_workspace_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM workspaces WHERE id = p_workspace_id AND owner_id = auth.uid()
  );
$$;

-- ── Step 2: Fix workspace_members SELECT policy (the recursive one) ──

DROP POLICY IF EXISTS "workspace_members_select_own" ON workspace_members;

-- Users can see their own membership rows.
-- Owners can see all members via the workspaces policy — no cross-table query needed here.
CREATE POLICY "workspace_members_select_own"
  ON workspace_members FOR SELECT
  USING (user_id = auth.uid());

-- Workspace owners can also see all members of their workspaces.
-- Use the SECURITY DEFINER function to avoid recursion.
CREATE POLICY "workspace_members_select_owner"
  ON workspace_members FOR SELECT
  USING (is_workspace_owner(workspace_id));

-- ── Step 3: Fix workspace_members INSERT policy ──

DROP POLICY IF EXISTS "workspace_members_insert_owner" ON workspace_members;

CREATE POLICY "workspace_members_insert_owner"
  ON workspace_members FOR INSERT
  WITH CHECK (is_workspace_owner(workspace_id));

-- ── Step 4: Fix workspace_members DELETE policy ──

DROP POLICY IF EXISTS "workspace_members_delete_owner" ON workspace_members;

CREATE POLICY "workspace_members_delete_owner"
  ON workspace_members FOR DELETE
  USING (is_workspace_owner(workspace_id));

-- ── Step 5: Also allow users to leave (delete their own membership) ──

DROP POLICY IF EXISTS "workspace_members_delete_self" ON workspace_members;

CREATE POLICY "workspace_members_delete_self"
  ON workspace_members FOR DELETE
  USING (user_id = auth.uid());
