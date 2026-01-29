-- Migration: Add Delete User Function
-- Timestamp: 2026-01-29 12:00:00 UTC
-- Description: Adds a secure RPC function to allow users to delete their own account.

-- Function: delete_user
-- Allows an authenticated user to delete their own account from auth.users.
-- Usage: supabase.rpc('delete_user')
create or replace function public.delete_user()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Delete the user from auth.users.
  -- The constraint 'id = auth.uid()' ensures a user can ONLY delete themselves.
  delete from auth.users
  where id = auth.uid();
end;
$$;

comment on function public.delete_user is 'Allows an authenticated user to delete their own account.';

-- Grant execute permission to authenticated users
grant execute on function public.delete_user to authenticated;
