-- Sub-admin role + granular permissions for staff operators.
-- Super admin: profiles.role = 'admin' (all permissions)
-- Sub admin:   profiles.role = 'sub_admin' + admin_permissions jsonb array

alter table public.profiles
  add column if not exists admin_permissions jsonb default '[]'::jsonb;

comment on column public.profiles.admin_permissions is
  'For role=sub_admin: array of permission keys e.g. ["curriculum","payments"]. Ignored for role=admin.';

create or replace function public.is_staff_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role in ('admin', 'sub_admin')
  );
$$;
