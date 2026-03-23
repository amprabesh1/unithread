-- UniThread Supabase MVP schema
-- Run this in Supabase SQL Editor

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  display_name text not null default 'Student',
  photo_url text,
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('post','ride','task','maintenance')),
  status text not null,
  title text,
  content text,
  image_url text,
  destination text,
  date_time timestamptz,
  seats int,
  price_split numeric(10,2),
  description text,
  category text,
  estimated_effort text,
  compensation text,
  location text,
  issue_description text,
  urgency text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.requests (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  from_user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('ride','task','maintenance')),
  status text not null default 'pending' check (status in ('pending','accepted','declined')),
  created_at timestamptz not null default now()
);

create unique index if not exists uq_requests_post_user_type
  on public.requests(post_id, from_user_id, type);

create table if not exists public.post_votes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  vote_type smallint not null check (vote_type in (-1, 1)),
  created_at timestamptz not null default now()
);

create unique index if not exists uq_post_votes_post_user
  on public.post_votes(post_id, user_id);

create table if not exists public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_posts_created_at on public.posts(created_at desc);
create index if not exists idx_requests_created_at on public.requests(created_at desc);
create index if not exists idx_comments_post on public.post_comments(post_id, created_at desc);
create index if not exists idx_votes_post on public.post_votes(post_id);

-- Auto-update updated_at
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_touch on public.profiles;
create trigger trg_profiles_touch before update on public.profiles
for each row execute function public.touch_updated_at();

drop trigger if exists trg_posts_touch on public.posts;
create trigger trg_posts_touch before update on public.posts
for each row execute function public.touch_updated_at();

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.requests enable row level security;
alter table public.post_votes enable row level security;
alter table public.post_comments enable row level security;

-- Profiles
drop policy if exists profiles_select_all on public.profiles;
create policy profiles_select_all on public.profiles
for select using (true);

drop policy if exists profiles_insert_self on public.profiles;
create policy profiles_insert_self on public.profiles
for insert with check (auth.uid() = id);

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
for update using (auth.uid() = id);

-- Posts
drop policy if exists posts_select_all on public.posts;
create policy posts_select_all on public.posts
for select using (true);

drop policy if exists posts_insert_auth on public.posts;
create policy posts_insert_auth on public.posts
for insert with check (auth.uid() = author_id);

drop policy if exists posts_update_owner on public.posts;
create policy posts_update_owner on public.posts
for update using (auth.uid() = author_id);

drop policy if exists posts_delete_owner on public.posts;
create policy posts_delete_owner on public.posts
for delete using (auth.uid() = author_id);

-- Requests
drop policy if exists requests_select_involved on public.requests;
create policy requests_select_involved on public.requests
for select using (
  auth.uid() = from_user_id
  or exists (select 1 from public.posts p where p.id = post_id and p.author_id = auth.uid())
  or true
);

drop policy if exists requests_insert_auth on public.requests;
create policy requests_insert_auth on public.requests
for insert with check (
  auth.uid() = from_user_id
  and exists (select 1 from public.posts p where p.id = post_id and p.author_id <> auth.uid())
);

drop policy if exists requests_update_involved on public.requests;
create policy requests_update_involved on public.requests
for update using (
  auth.uid() = from_user_id
  or exists (select 1 from public.posts p where p.id = post_id and p.author_id = auth.uid())
);

-- Votes
drop policy if exists votes_select_all on public.post_votes;
create policy votes_select_all on public.post_votes
for select using (true);

drop policy if exists votes_insert_self on public.post_votes;
create policy votes_insert_self on public.post_votes
for insert with check (auth.uid() = user_id);

drop policy if exists votes_update_self on public.post_votes;
create policy votes_update_self on public.post_votes
for update using (auth.uid() = user_id);

drop policy if exists votes_delete_self on public.post_votes;
create policy votes_delete_self on public.post_votes
for delete using (auth.uid() = user_id);

-- Comments
drop policy if exists comments_select_all on public.post_comments;
create policy comments_select_all on public.post_comments
for select using (true);

drop policy if exists comments_insert_self on public.post_comments;
create policy comments_insert_self on public.post_comments
for insert with check (auth.uid() = user_id);

drop policy if exists comments_update_self on public.post_comments;
create policy comments_update_self on public.post_comments
for update using (auth.uid() = user_id);

drop policy if exists comments_delete_self on public.post_comments;
create policy comments_delete_self on public.post_comments
for delete using (auth.uid() = user_id);

-- Storage bucket for post images
insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do nothing;

drop policy if exists post_images_read on storage.objects;
create policy post_images_read on storage.objects
for select using (bucket_id = 'post-images');

drop policy if exists post_images_insert_auth on storage.objects;
create policy post_images_insert_auth on storage.objects
for insert with check (
  bucket_id = 'post-images'
  and auth.role() = 'authenticated'
);

drop policy if exists post_images_update_owner on storage.objects;
create policy post_images_update_owner on storage.objects
for update using (
  bucket_id = 'post-images'
  and owner = auth.uid()
);

drop policy if exists post_images_delete_owner on storage.objects;
create policy post_images_delete_owner on storage.objects
for delete using (
  bucket_id = 'post-images'
  and owner = auth.uid()
);
