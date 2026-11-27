-- Weekly Retro — run once in Supabase → SQL Editor.
-- Anyone with the page link can read and write (no sign-in, by design).

create table if not exists public.retro_docs (
  path        text primary key,          -- "collection/docId", e.g. "checkins/2026-11-23__dear"
  collection  text not null,             -- checkins · answers · questions · daisies · cheers · gifts · reacts
  week        text,                      -- Monday of the week, "YYYY-MM-DD"
  data        jsonb not null,
  updated_at  timestamptz not null default now()
);
create index if not exists retro_docs_collection_week on public.retro_docs (collection, week);

-- realtime: send the old row on delete too, so the page knows which collection changed
alter table public.retro_docs replica identity full;
alter publication supabase_realtime add table public.retro_docs;

alter table public.retro_docs enable row level security;
create policy "retro read"   on public.retro_docs for select to anon, authenticated using (true);
create policy "retro insert" on public.retro_docs for insert to anon, authenticated with check (true);
create policy "retro update" on public.retro_docs for update to anon, authenticated using (true) with check (true);
create policy "retro delete" on public.retro_docs for delete to anon, authenticated using (true);

-- GIF files: public bucket, 20 MB, images only
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('retro-gifs', 'retro-gifs', true, 20971520, array['image/gif','image/webp','image/png','image/jpeg'])
on conflict (id) do nothing;
create policy "retro gif upload" on storage.objects for insert to anon, authenticated with check (bucket_id = 'retro-gifs');
