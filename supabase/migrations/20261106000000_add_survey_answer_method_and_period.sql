-- surveys に回答方法（オンライン / 対面）と実施期間を追加する。
-- 既存行の回答方法は、回答先が URL のものだけオンラインとみなし、それ以外は NULL（未設定）のままにする。
-- 実施期間は日程の決まっていない募集もあるため、開始日・終了日ともに省略可能にする
alter table public.surveys
  add column if not exists answer_method text
    check (answer_method in ('online', 'in_person')),
  add column if not exists period_start date,
  add column if not exists period_end date,
  add constraint surveys_period_order
    check (period_start is null or period_end is null or period_start <= period_end);

update public.surveys
  set answer_method = 'online'
  where contact_type = 'url' and answer_method is null;

comment on column public.surveys.answer_method is '回答方法。online はWebフォーム・メール・電話など、in_person は対面。NULL は未設定の既存行。';
comment on column public.surveys.period_start is '実施期間の開始日。NULL は開始日の指定なし。';
comment on column public.surveys.period_end is '実施期間の終了日。NULL は終了日の指定なし。';

-- 旧シグネチャを削除し、末尾に省略可能な回答方法・実施期間を追加する。
-- 古いフロントは新しい引数を送らないため、省略時は NULL として登録する
drop function if exists public.create_survey(text, text, text, text, text, boolean, integer, text[], text, text, text[]);

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
  p_preferred_requirements text[] default '{}',
  p_answer_method text default null,
  p_period_start date default null,
  p_period_end date default null
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
  if p_answer_method is not null and p_answer_method not in ('online', 'in_person') then
    raise exception 'answer_method must be one of online, in_person';
  end if;
  if p_period_start is not null and p_period_end is not null and p_period_start > p_period_end then
    raise exception 'period_start must be on or before period_end';
  end if;

  select coalesce(array_agg(trim(r)) filter (where trim(r) <> ''), '{}')
    into v_requirements
    from unnest(coalesce(p_requirements, '{}')) as r;

  select coalesce(array_agg(trim(r)) filter (where trim(r) <> ''), '{}')
    into v_preferred_requirements
    from unnest(coalesce(p_preferred_requirements, '{}')) as r;

  insert into public.surveys (
    title, recruiter_name, affiliation, contact_type, contact_value,
    requirements, description, has_reward, reward_detail, estimated_minutes, preferred_requirements,
    answer_method, period_start, period_end
  )
  values (
    p_title, p_recruiter_name, p_affiliation, p_contact_type, v_contact_value,
    v_requirements, v_description, p_has_reward,
    case when p_has_reward and v_reward_detail <> '' then v_reward_detail end,
    p_estimated_minutes, v_preferred_requirements,
    p_answer_method, p_period_start, p_period_end
  )
  returning * into v_survey;

  return v_survey;
end;
$$;

grant execute on function public.create_survey(text, text, text, text, text, boolean, integer, text[], text, text, text[], text, date, date) to anon, authenticated;
