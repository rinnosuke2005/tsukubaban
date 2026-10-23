-- 既存の requirements を必須条件として維持し、歓迎条件を別の配列に分ける。
-- 既存行の歓迎条件は空配列。既存クライアントの p_requirements は引き続き利用可能。
alter table public.surveys
  add column preferred_requirements text[] not null default '{}';

comment on column public.surveys.requirements is '参加に必要な必須条件。Web上で常時表示する。';
comment on column public.surveys.preferred_requirements is '参加に必須ではない歓迎条件。空配列は歓迎条件なし。';

-- 旧シグネチャを削除し、末尾に省略可能な歓迎条件を追加する。
drop function if exists public.create_survey(text, text, text, text, text, boolean, integer, text[], text, text);

-- PostgreSQL ではデフォルト付き引数より後ろにデフォルトなしの引数を置けないため、
-- 必須の p_has_reward / p_estimated_minutes は p_requirements より前に置く
create function public.create_survey(
  p_title text,
  p_recruiter_name text,
  p_affiliation text,
  p_contact_type text,
  p_contact_value text,
  p_has_reward boolean,
  p_estimated_minutes integer,
  p_requirements text[] default '{}',
  p_description text default '',
  p_reward_detail text default '',
  p_preferred_requirements text[] default '{}'
)
returns public.surveys
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_survey public.surveys;
  v_requirements text[];
  v_preferred_requirements text[];
  v_contact_value text := trim(p_contact_value);
  v_description text := trim(coalesce(p_description, ''));
  v_reward_detail text := trim(coalesce(p_reward_detail, ''));
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
  if p_has_reward is null then
    raise exception 'has_reward must not be null';
  end if;
  if p_estimated_minutes is null or p_estimated_minutes not between 1 and 999 then
    raise exception 'estimated_minutes must be between 1 and 999';
  end if;
  if char_length(v_reward_detail) > 100 then
    raise exception 'reward_detail must be 100 characters or less';
  end if;

  select coalesce(array_agg(trim(r)) filter (where trim(r) <> ''), '{}')
    into v_requirements
    from unnest(coalesce(p_requirements, '{}')) as r;

  select coalesce(array_agg(trim(r)) filter (where trim(r) <> ''), '{}')
    into v_preferred_requirements
    from unnest(coalesce(p_preferred_requirements, '{}')) as r;

  insert into public.surveys (
    title, recruiter_name, affiliation, contact_type, contact_value,
    requirements, description, has_reward, reward_detail, estimated_minutes, preferred_requirements
  )
  values (
    p_title, p_recruiter_name, p_affiliation, p_contact_type, v_contact_value,
    v_requirements, v_description, p_has_reward,
    case when p_has_reward and v_reward_detail <> '' then v_reward_detail end,
    p_estimated_minutes, v_preferred_requirements
  )
  returning * into v_survey;

  return v_survey;
end;
$$;

grant execute on function public.create_survey(text, text, text, text, text, boolean, integer, text[], text, text, text[]) to anon, authenticated;
