# Migration Notes

## Add audit_logs table

Add this table to your Supabase/PostgreSQL schema before deploying the new audit helper.

```sql
create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  action text not null,
  resource text not null,
  payload jsonb,
  ip text,
  created_at timestamptz not null default now()
);
```

If your database does not support `gen_random_uuid()`, use:

```sql
create extension if not exists "pgcrypto";
```

and then:

```sql
create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  action text not null,
  resource text not null,
  payload jsonb,
  ip text,
  created_at timestamptz not null default now()
);
```
