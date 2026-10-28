import {
  CONTACT_TYPE_LABELS,
  type ContactType,
  type Survey,
} from "@/lib/types/survey";

// 回答者は「手持ちの時間で終わるか」で探すため、範囲ではなく上限（N分以下）で絞り込む
export const DURATION_LIMITS = ["5", "10", "15", "30"] as const;

export type DurationLimit = (typeof DURATION_LIMITS)[number];

export type SurveyFilters = {
  contactType: "all" | ContactType;
  reward: "all" | "yes" | "no";
  duration: "all" | DurationLimit;
};

export const DEFAULT_SURVEY_FILTERS: SurveyFilters = {
  contactType: "all",
  reward: "all",
  duration: "all",
};

const FILTER_KEYS = Object.keys(
  DEFAULT_SURVEY_FILTERS,
) as (keyof SurveyFilters)[];

function isOneOf<T extends string>(
  value: string | null,
  candidates: readonly T[],
): value is T {
  return value !== null && (candidates as readonly string[]).includes(value);
}

// URL は手入力・古いリンクで任意の値が来るため、想定外の値は "all" として扱う
export function parseSurveyFilters(
  params: Pick<URLSearchParams, "get">,
): SurveyFilters {
  const contactType = params.get("contactType");
  const reward = params.get("reward");
  const duration = params.get("duration");

  return {
    contactType: isOneOf(
      contactType,
      Object.keys(CONTACT_TYPE_LABELS) as ContactType[],
    )
      ? contactType
      : "all",
    reward: isOneOf(reward, ["yes", "no"] as const) ? reward : "all",
    duration: isOneOf(duration, DURATION_LIMITS) ? duration : "all",
  };
}

// "all" の条件は URL に出さず、未指定の URL と同じ見た目にする
export function toSearchParams(filters: SurveyFilters): URLSearchParams {
  const params = new URLSearchParams();
  for (const key of FILTER_KEYS) {
    if (filters[key] !== "all") params.set(key, filters[key]);
  }
  return params;
}

export function isDefaultFilters(filters: SurveyFilters): boolean {
  return FILTER_KEYS.every(
    (key) => filters[key] === DEFAULT_SURVEY_FILTERS[key],
  );
}

// hasReward / estimatedMinutes が null（未設定）の募集は、その条件を指定したときは除外する
export function matchesFilters(
  survey: Pick<Survey, "contactType" | "hasReward" | "estimatedMinutes">,
  filters: SurveyFilters,
): boolean {
  if (
    filters.contactType !== "all" &&
    survey.contactType !== filters.contactType
  ) {
    return false;
  }

  if (filters.reward !== "all") {
    if (survey.hasReward === null) return false;
    if (survey.hasReward !== (filters.reward === "yes")) return false;
  }

  if (filters.duration !== "all") {
    const minutes = survey.estimatedMinutes;
    if (minutes === null) return false;
    if (minutes > Number(filters.duration)) return false;
  }

  return true;
}
