-- surveys に回答方法（オンライン / 対面）と実施日を追加し、所要時間を省略可能にする。
-- 既存行の回答方法は、回答先が URL のものだけオンラインとみなし、それ以外は NULL（未設定）のままにする。
-- 実施日は飛び飛びの日程を表せるよう日付の配列で持ち、空配列は「日程の指定なし」とする。
-- estimated_minutes 列は古いフロントが参照しているため、この migration では削除しない
alter table public.surveys
  add column if not exists answer_method text
    check (answer_method in ('online', 'in_person')),
  add column if not exists available_dates date[] not null default '{}';

update public.surveys
  set answer_method = 'online'
  where contact_type = 'url' and answer_method is null;

comment on column public.surveys.answer_method is '回答方法。online はWebフォーム・メール・電話など、in_person は対面。NULL は未設定の既存行。';
comment on column public.surveys.available_dates is '実施日の一覧（昇順・重複なし）。空配列は日程の指定なし。';
comment on column public.surveys.estimated_minutes is '廃止予定。新しい投稿では NULL。';

-- 旧シグネチャを削除し、末尾に省略可能な回答方法・実施日を追加する。
-- 古いフロントは新しい引数を送らないため、省略時は未設定として登録する。
-- 新しいフロントは所要時間を送らないため、p_estimated_minutes も省略可能にする
drop function if exists public.create_survey(text, text, text, text, text, boolean, integer, text[], text, text, text[]);

create function public.create_survey(
  p_title text,
  p_recruiter_name text,
  p_affiliation text,
  p_contact_type text,
  p_contact_value text,
  p_has_reward boolean,
  p_estimated_minutes integer default null,
  p_requirements text[] default '{}',
  p_description text default '',
  p_reward_detail text default '',
  p_preferred_requirements text[] default '{}',
  p_answer_method text default null,
  p_available_dates date[] default '{}'
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
  v_available_dates date[];
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
  if p_estimated_minutes is not null and p_estimated_minutes not between 1 and 999 then
    raise exception 'estimated_minutes must be between 1 and 999';
  end if;
  if char_length(v_reward_detail) > 100 then
    raise exception 'reward_detail must be 100 characters or less';
  end if;
  if p_answer_method is not null and p_answer_method not in ('online', 'in_person') then
    raise exception 'answer_method must be one of online, in_person';
  end if;

  select coalesce(array_agg(trim(r)) filter (where trim(r) <> ''), '{}')
    into v_requirements
    from unnest(coalesce(p_requirements, '{}')) as r;

  select coalesce(array_agg(trim(r)) filter (where trim(r) <> ''), '{}')
    into v_preferred_requirements
    from unnest(coalesce(p_preferred_requirements, '{}')) as r;

  select coalesce(array_agg(distinct d order by d) filter (where d is not null), '{}')
    into v_available_dates
    from unnest(coalesce(p_available_dates, '{}')) as d;

  if cardinality(v_available_dates) > 100 then
    raise exception 'available_dates must be 100 dates or less';
  end if;
  -- 対面は日程が分からないと参加の判断ができないため、実施日を必須にする
  if p_answer_method = 'in_person' and cardinality(v_available_dates) = 0 then
    raise exception 'available_dates must not be empty for in_person';
  end if;

  insert into public.surveys (
    title, recruiter_name, affiliation, contact_type, contact_value,
    requirements, description, has_reward, reward_detail, estimated_minutes, preferred_requirements,
    answer_method, available_dates
  )
  values (
    p_title, p_recruiter_name, p_affiliation, p_contact_type, v_contact_value,
    v_requirements, v_description, p_has_reward,
    case when p_has_reward and v_reward_detail <> '' then v_reward_detail end,
    p_estimated_minutes, v_preferred_requirements,
    p_answer_method, v_available_dates
  )
  returning * into v_survey;

  return v_survey;
end;
$$;

grant execute on function public.create_survey(text, text, text, text, text, boolean, integer, text[], text, text, text[], text, date[]) to anon, authenticated;
