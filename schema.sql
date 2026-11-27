-- Weekly Retro — run in Supabase → SQL Editor (project weekly-recap). Safe to run again.
-- Anyone with the page link can read and write (no sign-in, by design).

create table if not exists public.retro_docs (
  path        text primary key,          -- "collection/docId", e.g. "checkins/2026-11-23__dear"
  collection  text not null,             -- checkins · answers · questions · daisies · cheers · gifts · reacts
  week        text,                      -- Monday of the week, "YYYY-MM-DD"
  data        jsonb not null,
  updated_at  timestamptz not null default now()
);
create index if not exists retro_docs_collection_week on public.retro_docs (collection, week);

grant select, insert, update, delete on public.retro_docs to anon, authenticated;

alter table public.retro_docs enable row level security;
drop policy if exists "retro read"   on public.retro_docs;
drop policy if exists "retro insert" on public.retro_docs;
drop policy if exists "retro update" on public.retro_docs;
drop policy if exists "retro delete" on public.retro_docs;
create policy "retro read"   on public.retro_docs for select to anon, authenticated using (true);
create policy "retro insert" on public.retro_docs for insert to anon, authenticated with check (true);
create policy "retro update" on public.retro_docs for update to anon, authenticated using (true) with check (true);
create policy "retro delete" on public.retro_docs for delete to anon, authenticated using (true);

-- realtime: send the old row on delete too, so the page knows which collection changed
alter table public.retro_docs replica identity full;
do $$ begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'retro_docs') then
    alter publication supabase_realtime add table public.retro_docs;
  end if;
end $$;

-- GIF files: public bucket, 5 MB each, images only
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('retro-gifs', 'retro-gifs', true, 5242880, array['image/gif','image/webp','image/png','image/jpeg'])
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
drop policy if exists "retro gif upload" on storage.objects;
create policy "retro gif upload" on storage.objects for insert to anon, authenticated with check (bucket_id = 'retro-gifs');

-- reload the API's table list
notify pgrst, 'reload schema';

-- check: should return 1 row each
select 'table ok' as check, count(*) from information_schema.tables where table_schema = 'public' and table_name = 'retro_docs'
union all
select 'bucket ok', count(*) from storage.buckets where id = 'retro-gifs';
