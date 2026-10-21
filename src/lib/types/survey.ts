export type ContactType = "url" | "email" | "phone";

export type Survey = {
  id?: string;
  title: string;
  recruiterName: string;
  affiliation: string;
  contactType: ContactType;
  contactValue: string;
  description: string;
  requirements: string[];
  hasReward: boolean | null;
  rewardDetail: string;
  estimatedMinutes: number | null;
  createdAt?: string;
};

export const CONTACT_TYPE_LABELS: Record<ContactType, string> = {
  url: "Web回答",
  email: "メール回答",
  phone: "電話回答",
};

// 既存行は hasReward が null（未設定）のため、表示しない場合は null を返す
export function formatReward(
  survey: Pick<Survey, "hasReward" | "rewardDetail">,
): string | null {
  if (survey.hasReward === null) return null;
  if (!survey.hasReward) return "なし";
  return survey.rewardDetail ? `あり（${survey.rewardDetail}）` : "あり";
}
