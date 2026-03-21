-- ============================================================
-- BacPrep — Full Database Setup (v2 — Production Upgrade)
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Enable Extensions
create extension if not exists vector;

-- ============================================================
-- 2. PROFILES TABLE
-- ============================================================
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  student_type char(1) check (student_type in ('C', 'D')),
  is_admin boolean not null default false,
  created_at timestamp with time zone default timezone('utc', now()) not null
);

-- Function to handle new user profile creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, student_type, is_admin)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'student_type', 'C'), -- Default to C if not provided
    false
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function on signup
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RLS for profiles
alter table profiles enable row level security;

do $$ begin
  drop policy if exists "Users can read own profile" on profiles;
  drop policy if exists "Users can insert own profile" on profiles;
  drop policy if exists "Users can update own profile" on profiles;
end $$;

create policy "Users can read own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- ============================================================
-- 3. COURSES TABLE (with student_type)
-- ============================================================
create table if not exists courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subject text not null,
  student_type char(1) not null check (student_type in ('C', 'D')),
  pdf_url text,
  created_at timestamp with time zone default timezone('utc', now()) not null
);

-- RLS for courses
alter table courses enable row level security;

do $$ begin
  drop policy if exists "All authenticated users can read courses by type" on courses;
  drop policy if exists "Admins can manage courses" on courses;
end $$;

create policy "All authenticated users can read courses by type"
  on courses for select
  using (auth.role() = 'authenticated');

create policy "Admins can manage courses"
  on courses for all
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.is_admin = true
    )
  );

-- ============================================================
-- 4. EMBEDDINGS TABLE (with student_type)
-- ============================================================
create table if not exists embeddings (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references courses(id) on delete cascade,
  student_type char(1) not null check (student_type in ('C', 'D')),
  content text not null,
  embedding vector(1536)
);

-- RLS for embeddings
alter table embeddings enable row level security;

do $$ begin
  drop policy if exists "Authenticated users can read embeddings" on embeddings;
  drop policy if exists "Admins can manage embeddings" on embeddings;
end $$;

create policy "Authenticated users can read embeddings"
  on embeddings for select
  using (auth.role() = 'authenticated');

create policy "Admins can manage embeddings"
  on embeddings for all
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.is_admin = true
    )
  );

-- ============================================================
-- 5. PROGRESS TABLE
-- ============================================================
create table if not exists progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  quizzes_taken integer not null default 0,
  correct_answers integer not null default 0,
  total_questions integer not null default 0,
  updated_at timestamp with time zone default timezone('utc', now()) not null,
  unique(user_id)
);

-- RLS for progress
alter table progress enable row level security;

do $$ begin
  drop policy if exists "Users can read own progress" on progress;
  drop policy if exists "Users can update own progress" on progress;
  drop policy if exists "Users can modify own progress" on progress;
  drop policy if exists "Admins can read all progress" on progress;
end $$;

create policy "Users can read own progress"
  on progress for select
  using (auth.uid() = user_id);

create policy "Users can update own progress"
  on progress for insert
  with check (auth.uid() = user_id);

create policy "Users can modify own progress"
  on progress for update
  using (auth.uid() = user_id);

create policy "Admins can read all progress"
  on progress for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.is_admin = true
    )
  );

-- ============================================================
-- 6. match_documents RPC (updated to filter by student_type)
-- ============================================================
create or replace function match_documents (
  query_embedding vector(1536),
  match_count int default 5,
  filter_course_id uuid default null,
  filter_student_type char(1) default null
) returns table (
  id uuid,
  content text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    e.id,
    e.content,
    1 - (e.embedding <=> query_embedding) as similarity
  from embeddings e
  where
    (filter_course_id is null or e.course_id = filter_course_id)
    and (filter_student_type is null or e.student_type = filter_student_type)
  order by e.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- ============================================================
-- 8. STUDY SESSIONS TABLE
-- ============================================================
create table if not exists study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  subject text not null check (subject in ('Mathematics', 'Physics', 'Science')),
  date date not null,
  start_time time not null,
  end_time time not null,
  status text not null default 'pending' check (status in ('pending', 'completed')),
  created_at timestamp with time zone default timezone('utc', now()) not null
);

-- RLS for study_sessions
alter table study_sessions enable row level security;

do $$ begin
  drop policy if exists "Users can manage own study sessions" on study_sessions;
end $$;

create policy "Users can manage own study sessions"
  on study_sessions for all
  using (auth.uid() = user_id);

-- ============================================================
-- 9. Supabase Storage Bucket for PDFs (REPEATED FOR SAFETY)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('courses', 'courses', true)
on conflict (id) do nothing;
