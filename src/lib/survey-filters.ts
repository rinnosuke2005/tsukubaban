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
// 実施日が空の募集は日程の指定がないため、どの日を選んでも表示する
export function matchesFilters(
  survey: Pick<Survey, "answerMethod" | "hasReward" | "availableDates">,
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

  if (
    filters.date &&
    survey.availableDates.length > 0 &&
    !survey.availableDates.includes(filters.date)
  ) {
    return false;
  }

  return true;
}
