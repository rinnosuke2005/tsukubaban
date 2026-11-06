import { supabase } from "@/lib/supabase/client";
import type { AnswerMethod, ContactType, Survey } from "@/lib/types/survey";

type SurveyRow = {
  id: string;
  title: string;
  recruiter_name: string;
  affiliation: string;
  contact_type: ContactType;
  contact_value: string;
  description: string;
  requirements: string[];
  preferred_requirements: string[];
  has_reward: boolean | null;
  reward_detail: string | null;
  answer_method: AnswerMethod | null;
  available_dates: string[];
  created_at: string;
};

function toSurvey(row: SurveyRow): Survey {
  return {
    id: row.id,
    title: row.title,
    recruiterName: row.recruiter_name,
    affiliation: row.affiliation,
    contactType: row.contact_type,
    contactValue: row.contact_value,
    description: row.description ?? "",
    requirements: row.requirements ?? [],
    preferredRequirements: row.preferred_requirements ?? [],
    hasReward: row.has_reward,
    rewardDetail: row.reward_detail ?? "",
    answerMethod: row.answer_method,
    availableDates: row.available_dates ?? [],
    createdAt: row.created_at,
  };
}

export async function fetchSurveys(): Promise<Survey[]> {
  const { data, error } = await supabase.rpc("get_surveys");

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as SurveyRow[]).map(toSurvey);
}

export async function fetchSurvey(id: string): Promise<Survey | null> {
  const { data, error } = await supabase.rpc("get_survey", { p_id: id });

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as SurveyRow[];
  return rows.length > 0 ? toSurvey(rows[0]) : null;
}

export async function createSurvey(
  survey: Pick<
    Survey,
    | "title"
    | "recruiterName"
    | "affiliation"
    | "contactType"
    | "contactValue"
    | "description"
    | "requirements"
    | "preferredRequirements"
    | "hasReward"
    | "rewardDetail"
    | "answerMethod"
    | "availableDates"
  >,
): Promise<Survey> {
  const { data, error } = await supabase.rpc("create_survey", {
    p_title: survey.title,
    p_recruiter_name: survey.recruiterName,
    p_affiliation: survey.affiliation,
    p_contact_type: survey.contactType,
    p_contact_value: survey.contactValue,
    p_description: survey.description,
    p_requirements: survey.requirements,
    p_preferred_requirements: survey.preferredRequirements,
    p_has_reward: survey.hasReward,
    p_reward_detail: survey.rewardDetail,
    p_answer_method: survey.answerMethod,
    p_available_dates: survey.availableDates,
  });

  if (error) {
    throw new Error(error.message);
  }

  return toSurvey(data as SurveyRow);
}
