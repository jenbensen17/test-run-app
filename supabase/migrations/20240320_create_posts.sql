-- Drop the existing table if it exists
drop table if exists public.posts;

-- Create the posts table
create table public.posts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null,
  topic text not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  user_email text not null,
  status text not null check (status in ('pending', 'answered', 'resolved')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.posts enable row level security;

-- Create policies
-- Anyone can view posts
create policy "Anyone can view posts"
  on public.posts for select
  using (true);

-- Users can create their own posts
create policy "Users can create their own posts"
  on public.posts for insert
  with check (auth.uid() = user_id);

-- Users can update their own posts
create policy "Users can update their own posts"
  on public.posts for update
  using (auth.uid() = user_id);

-- Only instructors can delete posts
create policy "Only instructors can delete posts"
  on public.posts for delete
  using (
    exists (
      select 1 from public.user_roles
      where user_roles.user_id = auth.uid()
      and user_roles.role = 'instructor'
    )
  );

-- Create an index for faster queries
create index posts_user_id_idx on public.posts(user_id);
create index posts_created_at_idx on public.posts(created_at desc);
create index posts_status_idx on public.posts(status);
create index posts_topic_idx on public.posts(topic);

-- Create a function to automatically update the updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create a trigger to automatically update the updated_at timestamp
create trigger set_updated_at
  before update on public.posts
  for each row
  execute function public.handle_updated_at(); 