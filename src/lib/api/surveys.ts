import { supabase } from "@/lib/supabase/client";
import type { Survey } from "@/lib/types/survey";

type SurveyRow = {
  id: string;
  title: string;
  recruiter_name: string;
  affiliation: string;
  url: string;
  created_at: string;
};

function toSurvey(row: SurveyRow): Survey {
  return {
    id: row.id,
    title: row.title,
    recruiterName: row.recruiter_name,
    affiliation: row.affiliation,
    url: row.url,
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

export async function createSurvey(
  survey: Pick<Survey, "title" | "recruiterName" | "affiliation" | "url">,
): Promise<Survey> {
  const { data, error } = await supabase.rpc("create_survey", {
    p_title: survey.title,
    p_recruiter_name: survey.recruiterName,
    p_affiliation: survey.affiliation,
    p_url: survey.url,
  });

  if (error) {
    throw new Error(error.message);
  }

  return toSurvey(data as SurveyRow);
}
