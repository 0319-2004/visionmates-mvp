-- Enable UUIDs
create extension if not exists "uuid-ossp";

-- profiles
create table if not exists profiles (
  id uuid primary key default uuid_generate_v4(), -- will store auth.uid() on insert trigger
  auth_id uuid unique,
  email text,
  name text,
  avatar_url text,
  created_at timestamptz default now()
);

-- projects
create table if not exists projects (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references profiles(id) on delete set null,
  title text not null,
  purpose text not null,
  tags text[] default '{}',
  created_at timestamptz default now()
);

-- intents (interest levels)
create table if not exists intents (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  level text check (level in ('watch','raise','commit')) not null,
  created_at timestamptz default now()
);

-- comments
create table if not exists comments (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  text text not null,
  created_at timestamptz default now()
);

-- updates
create table if not exists updates (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  author_id uuid references profiles(id) on delete cascade,
  text text not null,
  created_at timestamptz default now()
);

-- Simple triggers to attach auth user to profiles
-- (Run separately to avoid requiring postgres superuser for auth.uid() in SQL editors)
-- For MVP, we'll allow anonymous reads & authed writes with RLS.

alter table profiles enable row level security;
alter table projects enable row level security;
alter table intents enable row level security;
alter table comments enable row level security;
alter table updates enable row level security;

-- Public SELECT
create policy "Public read projects" on projects for select using (true);
create policy "Public read intents" on intents for select using (true);
create policy "Public read comments" on comments for select using (true);
create policy "Public read updates" on updates for select using (true);
create policy "Public read profiles" on profiles for select using (true);

-- Authenticated INSERT (user must be logged in)
create policy "Insert projects authed" on projects
for insert with check (auth.role() = 'authenticated');

create policy "Insert intents authed" on intents
for insert with check (auth.role() = 'authenticated');

create policy "Insert comments authed" on comments
for insert with check (auth.role() = 'authenticated');

create policy "Insert updates authed" on updates
for insert with check (auth.role() = 'authenticated');

-- Update/Delete only by owner/author
create policy "Update own project" on projects
for update using (exists (select 1 from profiles where profiles.id = owner_id and profiles.auth_id = auth.uid()));

create policy "Delete own project" on projects
for delete using (exists (select 1 from profiles where profiles.id = owner_id and profiles.auth_id = auth.uid()));

-- Attach auth user to profiles row (upsert via RPC or manually)
-- For MVP, create a simple function to upsert profile on first sign-in.
create or replace function public.ensure_profile()
returns void language plpgsql security definer as $$
declare
  uid uuid := auth.uid();
  em text;
begin
  select email into em from auth.users where id = uid;
  insert into profiles (auth_id, email) values (uid, em)
  on conflict (auth_id) do update set email = excluded.email;
end; $$;

-- Helper RPCs to serve list pages with counts
create or replace function public.list_projects_with_counts()
returns table (
  id uuid,
  title text,
  purpose text,
  tags text[],
  created_at timestamptz,
  watch_count bigint,
  raise_count bigint,
  commit_count bigint,
  comment_count bigint,
  update_count bigint
) language sql as $$
  select
    p.id, p.title, p.purpose, p.tags, p.created_at,
    coalesce(sum(case when i.level='watch' then 1 else 0 end),0) as watch_count,
    coalesce(sum(case when i.level='raise' then 1 else 0 end),0) as raise_count,
    coalesce(sum(case when i.level='commit' then 1 else 0 end),0) as commit_count,
    coalesce(c.comment_count,0) as comment_count,
    coalesce(u.update_count,0) as update_count
  from projects p
  left join intents i on i.project_id = p.id
  left join (
    select project_id, count(*) as comment_count from comments group by project_id
  ) c on c.project_id = p.id
  left join (
    select project_id, count(*) as update_count from updates group by project_id
  ) u on u.project_id = p.id
  group by p.id, c.comment_count, u.update_count
  order by p.created_at desc;
$$;

create or replace function public.get_project_with_counts(pid uuid)
returns table (
  id uuid,
  title text,
  purpose text,
  tags text[],
  created_at timestamptz,
  watch_count bigint,
  raise_count bigint,
  commit_count bigint,
  comment_count bigint,
  update_count bigint
) language sql as $$
  select * from public.list_projects_with_counts() where id = pid;
$$;
