-- Overhaul questionnaire answers — anyone with the link can submit, nobody (anon) can read.
create table if not exists public.oh_answers (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  name        text not null check (char_length(name) between 1 and 120),
  team        text not null check (char_length(team) <= 60),
  answers     jsonb not null,
  summary     text check (char_length(summary) <= 4000),
  note        text check (char_length(note) <= 4000)
);
grant insert on public.oh_answers to anon, authenticated;
revoke select, update, delete on public.oh_answers from anon, authenticated;
alter table public.oh_answers enable row level security;
drop policy if exists "oh insert" on public.oh_answers;
create policy "oh insert" on public.oh_answers for insert to anon, authenticated with check (true);
select 'oh_answers ok' as check, count(*) from information_schema.tables where table_schema='public' and table_name='oh_answers';
