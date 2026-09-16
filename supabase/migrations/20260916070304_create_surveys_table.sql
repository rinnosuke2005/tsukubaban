create table if not exists public.surveys (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  recruiter_name text not null,
  affiliation text not null,
  url text not null,
  created_at timestamptz not null default now()
);
