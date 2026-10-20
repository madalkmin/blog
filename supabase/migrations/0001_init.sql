-- Diário de viagem: esquema inicial
-- Leitura pública das viagens publicadas; escrita apenas pelos e-mails em app_private.blog_admins.

create schema if not exists app_private;

-- Quem pode editar o blog
create table if not exists app_private.blog_admins (
  email text primary key
);

insert into app_private.blog_admins (email) values
  ('dalkminmatheus@gmail.com'),
  ('matheushdalkmin@gmail.com')
on conflict do nothing;

create or replace function public.is_blog_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from app_private.blog_admins
    where email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

grant execute on function public.is_blog_admin() to anon, authenticated;

-- Viagens (cada "bloco" do diário)
create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null default 'Nova viagem',
  subtitle text not null default '',
  location text not null default '',
  preset text not null default 'floresta'
    check (preset in ('floresta', 'montanha', 'praia', 'deserto', 'cidade')),
  cover_url text,
  start_date date,
  end_date date,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Seções de cada viagem (capítulos do diário, com conteúdo rico do editor)
create table if not exists public.sections (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  title text not null default '',
  content jsonb not null default '{"type":"doc","content":[]}'::jsonb,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sections_trip_position_idx on public.sections (trip_id, position);
create index if not exists trips_published_start_idx on public.trips (published, start_date desc);

-- updated_at automático
create or replace function app_private.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Alterar uma seção também marca a viagem como atualizada
create or replace function app_private.touch_parent_trip()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.trips set updated_at = now()
  where id = coalesce(new.trip_id, old.trip_id);
  return null;
end;
$$;

drop trigger if exists trips_touch on public.trips;
create trigger trips_touch before update on public.trips
  for each row execute function app_private.touch_updated_at();

drop trigger if exists sections_touch on public.sections;
create trigger sections_touch before update on public.sections
  for each row execute function app_private.touch_updated_at();

drop trigger if exists sections_touch_trip on public.sections;
create trigger sections_touch_trip after insert or update or delete on public.sections
  for each row execute function app_private.touch_parent_trip();

-- RLS
alter table public.trips enable row level security;
alter table public.sections enable row level security;

drop policy if exists "trips: leitura" on public.trips;
create policy "trips: leitura" on public.trips
  for select to anon, authenticated
  using (published or (select public.is_blog_admin()));

drop policy if exists "trips: admin insere" on public.trips;
create policy "trips: admin insere" on public.trips
  for insert to authenticated
  with check ((select public.is_blog_admin()));

drop policy if exists "trips: admin atualiza" on public.trips;
create policy "trips: admin atualiza" on public.trips
  for update to authenticated
  using ((select public.is_blog_admin()))
  with check ((select public.is_blog_admin()));

drop policy if exists "trips: admin remove" on public.trips;
create policy "trips: admin remove" on public.trips
  for delete to authenticated
  using ((select public.is_blog_admin()));

drop policy if exists "sections: leitura" on public.sections;
create policy "sections: leitura" on public.sections
  for select to anon, authenticated
  using (
    (select public.is_blog_admin())
    or exists (select 1 from public.trips t where t.id = trip_id and t.published)
  );

drop policy if exists "sections: admin insere" on public.sections;
create policy "sections: admin insere" on public.sections
  for insert to authenticated
  with check ((select public.is_blog_admin()));

drop policy if exists "sections: admin atualiza" on public.sections;
create policy "sections: admin atualiza" on public.sections
  for update to authenticated
  using ((select public.is_blog_admin()))
  with check ((select public.is_blog_admin()));

drop policy if exists "sections: admin remove" on public.sections;
create policy "sections: admin remove" on public.sections
  for delete to authenticated
  using ((select public.is_blog_admin()));

-- Storage: bucket público para imagens, upload só pelo admin
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 20971520, array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "media: admin envia" on storage.objects;
create policy "media: admin envia" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'media' and (select public.is_blog_admin()));

drop policy if exists "media: admin atualiza" on storage.objects;
create policy "media: admin atualiza" on storage.objects
  for update to authenticated
  using (bucket_id = 'media' and (select public.is_blog_admin()));

drop policy if exists "media: admin remove" on storage.objects;
create policy "media: admin remove" on storage.objects
  for delete to authenticated
  using (bucket_id = 'media' and (select public.is_blog_admin()));
