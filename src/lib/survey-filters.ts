import type { ContactType, Survey } from "@/lib/types/survey";

// 所要時間はフォームで整数（分）に制限しているため、境界は両端を含む整数で持つ
export const DURATION_RANGES = {
  "lte-5": { label: "5分以下", min: null, max: 5 },
  "6-10": { label: "6〜10分", min: 6, max: 10 },
  "11-30": { label: "11〜30分", min: 11, max: 30 },
  "31-59": { label: "31〜59分", min: 31, max: 59 },
  "gte-60": { label: "60分以上", min: 60, max: null },
} as const satisfies Record<
  string,
  { label: string; min: number | null; max: number | null }
>;

export type DurationRange = keyof typeof DURATION_RANGES;

export type SurveyFilters = {
  contactType: "all" | ContactType;
  reward: "all" | "yes" | "no";
  duration: "all" | DurationRange;
};

export const DEFAULT_SURVEY_FILTERS: SurveyFilters = {
  contactType: "all",
  reward: "all",
  duration: "all",
};

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
    const { min, max } = DURATION_RANGES[filters.duration];
    if (min !== null && minutes < min) return false;
    if (max !== null && minutes > max) return false;
  }

  return true;
}
