export type ContactType = "url" | "email" | "phone";

export type AnswerMethod = "online" | "in_person";

export type Survey = {
  id?: string;
  title: string;
  recruiterName: string;
  affiliation: string;
  contactType: ContactType;
  contactValue: string;
  description: string;
  requirements: string[];
  preferredRequirements: string[];
  hasReward: boolean | null;
  rewardDetail: string;
  estimatedMinutes: number | null;
  // 既存行は未設定（null）の場合がある
  answerMethod: AnswerMethod | null;
  // "YYYY-MM-DD" 形式。null は日付の指定なし
  periodStart: string | null;
  periodEnd: string | null;
  createdAt?: string;
};

export const CONTACT_TYPE_LABELS: Record<ContactType, string> = {
  url: "URL",
  email: "メール",
  phone: "電話",
};

export const ANSWER_METHOD_LABELS: Record<AnswerMethod, string> = {
  online: "オンライン",
  in_person: "対面",
};

// タイムゾーンのずれを避けるため、Date に変換せず文字列のまま月日を取り出す
function formatMonthDay(date: string): string {
  const [, month, day] = date.split("-").map(Number);
  return `${month}/${day}`;
}

// 開始日・終了日のどちらも未指定なら null を返す
export function formatPeriod(
  survey: Pick<Survey, "periodStart" | "periodEnd">,
): string | null {
  const { periodStart, periodEnd } = survey;
  if (!periodStart && !periodEnd) return null;
  if (periodStart === periodEnd) return formatMonthDay(periodStart!);
  const start = periodStart ? formatMonthDay(periodStart) : "";
  const end = periodEnd ? formatMonthDay(periodEnd) : "";
  return `${start}〜${end}`;
}

// 既存行は hasReward が null（未設定）のため、表示しない場合は null を返す
export function formatReward(
  survey: Pick<Survey, "hasReward" | "rewardDetail">,
): string | null {
  if (survey.hasReward === null) return null;
  if (!survey.hasReward) return "なし";
  return survey.rewardDetail ? `あり（${survey.rewardDetail}）` : "あり";
}
