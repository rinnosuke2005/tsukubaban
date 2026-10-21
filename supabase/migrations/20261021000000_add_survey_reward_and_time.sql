-- surveys に謝礼の有無・謝礼の内容・所要時間（分）を追加する。
-- 既存行は NULL のまま「未設定」として扱う（not null default にすると、不明な既存行が
-- 「謝礼なし」と表示されてしまうため）。必須化は create_survey 側だけで行う
alter table public.surveys
  add column if not exists has_reward boolean,
  add column if not exists reward_detail text,
  add column if not exists estimated_minutes integer
    check (estimated_minutes between 1 and 999);

drop function if exists public.create_survey(text, text, text, text, text, text[], text);

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
  p_reward_detail text default ''
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

  insert into public.surveys (
    title, recruiter_name, affiliation, contact_type, contact_value,
    requirements, description, has_reward, reward_detail, estimated_minutes
  )
  values (
    p_title, p_recruiter_name, p_affiliation, p_contact_type, v_contact_value,
    v_requirements, v_description, p_has_reward,
    case when p_has_reward and v_reward_detail <> '' then v_reward_detail end,
    p_estimated_minutes
  )
  returning * into v_survey;

  return v_survey;
end;
$$;

grant execute on function public.create_survey(text, text, text, text, text, boolean, integer, text[], text, text) to anon, authenticated;
