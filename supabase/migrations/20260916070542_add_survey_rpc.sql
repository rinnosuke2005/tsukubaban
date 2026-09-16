-- surveys テーブルへの直接アクセスを塞ぎ、RPC 関数経由に限定する
alter table public.surveys enable row level security;
revoke all on public.surveys from anon, authenticated;

create or replace function public.get_surveys()
returns setof public.surveys
language sql
security definer
set search_path = public, pg_temp
stable
as $$
  select id, title, recruiter_name, affiliation, url, created_at
  from public.surveys
  order by created_at desc;
$$;

create or replace function public.create_survey(
  p_title text,
  p_recruiter_name text,
  p_affiliation text,
  p_url text
)
returns public.surveys
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_survey public.surveys;
begin
  if trim(p_title) = '' then
    raise exception 'title must not be empty';
  end if;
  if trim(p_recruiter_name) = '' then
    raise exception 'recruiter_name must not be empty';
  end if;
  if trim(p_affiliation) = '' then
    raise exception 'affiliation must not be empty';
  end if;
  if trim(p_url) = '' then
    raise exception 'url must not be empty';
  end if;

  insert into public.surveys (title, recruiter_name, affiliation, url)
  values (p_title, p_recruiter_name, p_affiliation, p_url)
  returning * into v_survey;

  return v_survey;
end;
$$;

grant execute on function public.get_surveys() to anon, authenticated;
grant execute on function public.create_survey(text, text, text, text) to anon, authenticated;
