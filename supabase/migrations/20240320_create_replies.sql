-- Drop the existing table if it exists
drop table if exists public.replies;

-- Create the replies table
create table public.replies (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  content text not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  user_email text not null,
  is_ai_response boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create the upvotes table
create table public.upvotes (
  id uuid default gen_random_uuid() primary key,
  reply_id uuid references public.replies(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(reply_id, user_id)
);

-- Set up Row Level Security (RLS)
alter table public.replies enable row level security;
alter table public.upvotes enable row level security;

-- Create policies for replies
create policy "Anyone can view replies"
  on public.replies for select
  using (true);

create policy "Users can create their own replies"
  on public.replies for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own replies"
  on public.replies for update
  using (auth.uid() = user_id);

create policy "Only instructors can delete replies"
  on public.replies for delete
  using (
    exists (
      select 1 from public.user_roles
      where user_roles.user_id = auth.uid()
      and user_roles.role = 'instructor'
    )
  );

-- Create policies for upvotes
create policy "Anyone can view upvotes"
  on public.upvotes for select
  using (true);

create policy "Users can create their own upvotes"
  on public.upvotes for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own upvotes"
  on public.upvotes for delete
  using (auth.uid() = user_id);

-- Create indexes
create index replies_post_id_idx on public.replies(post_id);
create index replies_created_at_idx on public.replies(created_at desc);
create index upvotes_reply_id_idx on public.upvotes(reply_id);
create index upvotes_user_id_idx on public.upvotes(user_id);

-- Create a function to automatically update the updated_at timestamp
create or replace function public.handle_reply_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create a trigger to automatically update the updated_at timestamp
create trigger set_reply_updated_at
  before update on public.replies
  for each row
  execute function public.handle_reply_updated_at(); 