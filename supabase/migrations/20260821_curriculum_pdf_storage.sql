-- Private storage for official curriculum PDFs.
-- Apply after the curriculum import schema migrations.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'curriculum-pdfs',
  'curriculum-pdfs',
  false,
  52428800,
  array['application/pdf']::text[]
)
on conflict (id) do update set
  name = excluded.name,
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Admins can read curriculum PDFs"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'curriculum-pdfs'
  and exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

create policy "Admins can upload curriculum PDFs"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'curriculum-pdfs'
  and exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

create policy "Admins can update curriculum PDFs"
on storage.objects
for update
 to authenticated
using (
  bucket_id = 'curriculum-pdfs'
  and exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
)
with check (
  bucket_id = 'curriculum-pdfs'
  and exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

create policy "Admins can delete curriculum PDFs"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'curriculum-pdfs'
  and exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);
