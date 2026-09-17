-- surveys に募集要項（応募条件）を配列で保持するカラムを追加する
alter table public.surveys
  add column if not exists requirements text[] not null default '{}';

drop function if exists public.create_survey(text, text, text, text);

create function public.create_survey(
  p_title text,
  p_recruiter_name text,
  p_affiliation text,
  p_url text,
  p_requirements text[] default '{}'
)
returns public.surveys
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_survey public.surveys;
  v_requirements text[];
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

  select coalesce(array_agg(trim(r)) filter (where trim(r) <> ''), '{}')
    into v_requirements
    from unnest(coalesce(p_requirements, '{}')) as r;

  insert into public.surveys (title, recruiter_name, affiliation, url, requirements)
  values (p_title, p_recruiter_name, p_affiliation, p_url, v_requirements)
  returning * into v_survey;

  return v_survey;
end;
$$;

create or replace function public.get_surveys()
returns setof public.surveys
language sql
security definer
set search_path = public, pg_temp
stable
as $$
  select id, title, recruiter_name, affiliation, url, created_at, requirements
  from public.surveys
  order by created_at desc;
$$;

grant execute on function public.create_survey(text, text, text, text, text[]) to anon, authenticated;
