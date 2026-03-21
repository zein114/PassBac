-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Create a table to store courses
create table if not exists courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subject text not null,
  pdf_url text, -- URL in Supabase Storage or external
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create a table to store document embeddings
create table if not exists embeddings (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references courses(id) on delete cascade,
  content text not null, -- The actual text content
  embedding vector(1536) -- OpenAI embeddings are 1536 dimensions
);

-- Create a function to similarity search for embeddings
create or replace function match_documents (
  query_embedding vector(1536),
  match_count int default null,
  filter_course_id uuid default null
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
  where filter_course_id is null or e.course_id = filter_course_id
  order by e.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- Create Storage Bucket for PDFs
-- Run this manually in Supabase UI or using the SQL below if you have admin privileges:
insert into storage.buckets (id, name, public) 
values ('courses', 'courses', true)
on conflict (id) do nothing;

-- Create policies for storage
create policy "Public access to courses bucket" on storage.objects
  for select using (bucket_id = 'courses');

create policy "Authenticated users can upload" on storage.objects
  for insert with check (bucket_id = 'courses' and auth.role() = 'authenticated');
