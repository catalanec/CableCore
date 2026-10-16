-- 2026-10-17 — security hardening.
-- All app access goes through the server with the service-role key, which
-- bypasses RLS. Public API roles (anon / authenticated) need no access at all.

-- Applied 2026-10-17 (migration lock_down_reset_invoice_sequence):
alter function public.reset_invoice_sequence() set search_path = public, pg_temp;
revoke execute on function public.reset_invoice_sequence() from public, anon, authenticated;
grant execute on function public.reset_invoice_sequence() to service_role;

-- harden_rls_and_grants:
-- "Allow all" let anyone with the public key read/modify project_photos.
drop policy if exists "Allow all operations on project_photos" on public.project_photos;
-- auth.role() = 'authenticated' let any self-registered Supabase user read all
-- leads / projects / quotes / materials. The CRM does not use Supabase Auth.
drop policy if exists auth_leads on public.leads;
drop policy if exists auth_materials on public.materials;
drop policy if exists auth_projects on public.projects;
drop policy if exists auth_quotes on public.quotes;
-- Forms insert through /api/leads and /api/quotes (service key, rate-limited);
-- direct anon inserts bypassed the honeypot and the rate limit.
drop policy if exists anon_insert_leads on public.leads;
drop policy if exists anon_insert_quotes on public.quotes;

revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
revoke execute on all functions in schema public from public, anon, authenticated;

-- Storage: uploads/listing go through /api/photos (service key). The bucket is
-- public, so /object/public/ URLs keep working without these policies.
drop policy if exists "Allow public read 1pweoxh_0" on storage.objects;
drop policy if exists "Allow authenticated upload 1pweoxh_0" on storage.objects;
