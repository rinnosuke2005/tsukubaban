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
  // 既存行は未設定（null）の場合がある
  answerMethod: AnswerMethod | null;
  // "YYYY-MM-DD" 形式の昇順。空配列は日程の指定なし
  availableDates: string[];
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

// 既存行は hasReward が null（未設定）のため、表示しない場合は null を返す
export function formatReward(
  survey: Pick<Survey, "hasReward" | "rewardDetail">,
): string | null {
  if (survey.hasReward === null) return null;
  if (!survey.hasReward) return "なし";
  return survey.rewardDetail ? `あり（${survey.rewardDetail}）` : "あり";
}
