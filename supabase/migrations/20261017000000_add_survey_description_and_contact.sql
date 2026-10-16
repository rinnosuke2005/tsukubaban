-- surveys に回答方法（URL / メール / 電話）を追加する。概要（description）は
-- 20261016000000_add_survey_description.sql で追加済み。
-- 既存の url は回答方法 "url" の値として contact_value に引き継ぐ
alter table public.surveys rename column url to contact_value;
alter table public.surveys
  add column if not exists contact_type text not null default 'url'
    check (contact_type in ('url', 'email', 'phone'));
alter table public.surveys alter column contact_type drop default;

-- url 前提の旧シグネチャを破棄する（20261016000000 で追加された 6 引数版を含む）
drop function if exists public.create_survey(text, text, text, text, text[]);
drop function if exists public.create_survey(text, text, text, text, text[], text);

create function public.create_survey(
  p_title text,
  p_recruiter_name text,
  p_affiliation text,
  p_contact_type text,
  p_contact_value text,
  p_requirements text[] default '{}',
  p_description text default ''
)
returns public.surveys
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_survey public.surveys;
  v_requirements text[];
  v_contact_value text := trim(p_contact_value);
  v_description text := trim(coalesce(p_description, ''));
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
  if p_contact_type not in ('url', 'email', 'phone') then
    raise exception 'contact_type must be one of url, email, phone';
  end if;
  if v_contact_value = '' then
    raise exception 'contact_value must not be empty';
  end if;
  if p_contact_type = 'url' and v_contact_value !~* '^https?://' then
    raise exception 'contact_value must be an http(s) url';
  end if;
  if p_contact_type = 'email' and v_contact_value !~ '^[^@\s]+@[^@\s]+$' then
    raise exception 'contact_value must be an email address';
  end if;
  if char_length(v_description) > 700 then
    raise exception 'description must be 700 characters or less';
  end if;

  select coalesce(array_agg(trim(r)) filter (where trim(r) <> ''), '{}')
    into v_requirements
    from unnest(coalesce(p_requirements, '{}')) as r;

  insert into public.surveys (
    title, recruiter_name, affiliation, contact_type, contact_value,
    requirements, description
  )
  values (
    p_title, p_recruiter_name, p_affiliation, p_contact_type, v_contact_value,
    v_requirements, v_description
  )
  returning * into v_survey;

  return v_survey;
end;
$$;

-- setof public.surveys は列の位置で対応付けられるため、列を列挙せず * で返す
create or replace function public.get_surveys()
returns setof public.surveys
language sql
security definer
set search_path = public, pg_temp
stable
as $$
  select *
  from public.surveys
  order by created_at desc;
$$;

create function public.get_survey(p_id uuid)
returns setof public.surveys
language sql
security definer
set search_path = public, pg_temp
stable
as $$
  select *
  from public.surveys
  where id = p_id;
$$;

grant execute on function public.create_survey(text, text, text, text, text, text[], text) to anon, authenticated;
grant execute on function public.get_survey(uuid) to anon, authenticated;
