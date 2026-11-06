import type { AnswerMethod, Survey } from "@/lib/types/survey";

export type SurveyFilters = {
  answerMethod: "all" | AnswerMethod;
  reward: "all" | "yes" | "no";
  // 参加したい日（"YYYY-MM-DD"）。空文字は指定なし
  date: string;
};

export const DEFAULT_SURVEY_FILTERS: SurveyFilters = {
  answerMethod: "all",
  reward: "all",
  date: "",
};

// answerMethod / hasReward が null（未設定）の募集は、その条件を指定したときは除外する。
// 実施期間は未指定の側を「制限なし」とみなす。日付は "YYYY-MM-DD" 同士なので文字列で比較できる
export function matchesFilters(
  survey: Pick<
    Survey,
    "answerMethod" | "hasReward" | "periodStart" | "periodEnd"
  >,
  filters: SurveyFilters,
): boolean {
  if (
    filters.answerMethod !== "all" &&
    survey.answerMethod !== filters.answerMethod
  ) {
    return false;
  }

  if (filters.reward !== "all") {
    if (survey.hasReward === null) return false;
    if (survey.hasReward !== (filters.reward === "yes")) return false;
  }

  if (filters.date) {
    if (survey.periodStart && filters.date < survey.periodStart) return false;
    if (survey.periodEnd && filters.date > survey.periodEnd) return false;
  }

  return true;
}
